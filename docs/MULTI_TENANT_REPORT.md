# Multi-Tenant Data Isolation & Platform Administration Architecture Report

**Project:** SoleFlow / ShoeConnect Footwear B2B Wholesale Platform  
**Migration:** `supabase/migrations/0013_multi_tenant_isolation.sql` & `supabase/seed_demo.sql`  
**Security Level:** Enterprise Grade Multi-Tenant Isolation with PostgreSQL Row-Level Security (RLS) & RESTRICTIVE Policies

---

## 1. Executive Summary
This document outlines the multi-tenant architecture implemented to guarantee strict data isolation between independent business organizations, alongside a unified Platform Admin console for the platform owner.

### Core Architecture Highlights:
1. **Single Database Schema with Row-Level Multi-Tenancy:**
   - Instead of fragile separate Postgres schemas, data isolation is enforced at the database kernel level through `org_id` on all 21 business tables, indexed and enforced via the `force_org_id()` trigger and `tenant_isolation` **RESTRICTIVE** policies.
2. **Three-Tier Access Boundary:**
   - **`super_admin` (Platform Owner):** Can view and manage all business organizations, switch active tenant view, and monitor system metrics. Fenced from demo interference.
   - **`admin` (Business Owner):** Created automatically upon signup. Full access to their own organization's catalog, orders, customers, finances, and team.
   - **`salesperson` (Field Executive):** Invited by a business admin. Constrained to their assigned customers and orders within their organization.
3. **Automated Signup & Organization Provisioning:**
   - `handle_new_user()` trigger on `auth.users` creates a new row in `organizations`, assigns the user as `role = 'admin'`, and seeds default `app_settings` for that business.
   - Support for invite tokens (`org_invites`) allows team members to join existing workspaces directly.
4. **Demo Account Safety Fencing:**
   - Demo super admin can only view and manage organizations where `is_demo = true`. Real customer and business data is completely invisible to demo logins.

---

## 2. Database Schema & Tables Modified

### 2.1 New Core Tables
| Table | Description | RLS Enforcement |
|---|---|---|
| `public.organizations` | Stores business identity (name, phone, city, GSTIN, owner, status, is_demo). | Authenticated users can only select their own org. Super admin sees all. |
| `public.org_invites` | Tokenized 7-day invitations for new team members. | Admin of the specific organization can manage. |
| `public.super_admin_access_log` | Security audit trail recording cross-tenant mutations by super admins. | Readable only by super admins. |

### 2.2 Altered Tables (Attached `org_id` + Trigger + RESTRICTIVE RLS)
The following 21 public business tables have `org_id UUID NOT NULL REFERENCES organizations(id)` with index `idx_<t>_org_id`, `trg_<t>_force_org` trigger, and `tenant_isolation` RESTRICTIVE policy:
1. `customers`
2. `designs`
3. `design_images`
4. `design_shares`
5. `design_share_items`
6. `orders`
7. `order_items`
8. `order_status_history`
9. `payments`
10. `payment_allocations`
11. `payment_adjustments`
12. `manufacturers`
13. `sales_team`
14. `field_visits`
15. `follow_ups`
16. `discount_requests`
17. `notifications`
18. `activity_events`
19. `audit_logs`
20. `client_notes`
21. `app_settings`

---

## 3. Storage & Lookbook Security

1. **Storage Buckets (`design-images` & `payment-receipts`):**
   - Objects are partitioned by organization ID: `<org_id>/designs/<uuid>.<ext>` and `<org_id>/receipts/<uuid>.<ext>`.
   - Storage RLS policy enforces `public.can_access_org(((storage.foldername(name))[1])::uuid)`.
2. **Public Lookbook RPC (`get_shared_designs`):**
   - Reads catalog designs linked through `design_shares` and returns only items belonging to that specific organization.

---

## 4. How to Grant Super Admin (Platform Owner)

Super admin privileges can **never** be assigned via client API requests or signup forms (guarded by `guard_profile_role_change` trigger). Grant it once directly in the Supabase SQL Editor:

```sql
-- Grant platform owner privileges to your email:
UPDATE public.profiles 
SET is_super_admin = true 
WHERE email = 'your-platform-owner-email@domain.com';
```

---

## 5. Security Access Matrix

| Role | Own Org Data | Other Org Data | Platform Console | Storage Folders |
|---|---|---|---|---|
| **Super Admin (Platform Owner)** | Full Access | Full Access | Visible | All Orgs |
| **Demo Super Admin** | Demo Orgs Only | 0 Rows of Real Orgs | Visible (Demo Fenced) | Demo Orgs Only |
| **Business Admin** | Full Access | Blocked (0 Rows) | Hidden | Own Org Only |
| **Salesperson** | Assigned Clients Only | Blocked (0 Rows) | Hidden | Own Org Only |
| **Anonymous** | Blocked | Blocked | Hidden | Denied (Except Public Lookbook Token) |

---

## 6. Testing & Verification

Run the automated tenant isolation verification test:
```bash
npm run test:isolation
```
