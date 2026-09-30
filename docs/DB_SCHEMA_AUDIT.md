# Database Schema Audit — ShoeConnect / SoleFlow
_Static audit, 30 Sep 2026. Compared every write in `frontend/src` + `backend/src` against `supabase/migrations/0001–0009`._
_Live Supabase could not be reached from the audit environment — run `DATABASE_AUDIT_PROMPT.md` locally for the live test._

## Summary
| Result | Count |
|---|---|
| OK (table + columns / RPC + args match) | 14 |
| Missing table / RPC | 4 |
| Wrong RPC arguments | 7 |
| Wrong column names | 6 |
| Dynamic payload (needs manual check) | 11 |

## 🔴 Will fail — table / function does not exist
| Where | Code uses | DB has |
|---|---|---|
| `frontend/src/services/clients.ts:120,160` | `from('clients')` | `customers` |
| `frontend/src/services/salesmen.ts:43,69` · `backend/src/routes/admin.js:62` | `from('salesmen')` | `sales_team` |
| `frontend/src/services/salesmen.ts:52` | `.update()` on `v_salesman_performance` | a VIEW — can't update, write to `sales_team` |
| `frontend/src/pages/public/PublicLookbookPage.tsx:45` | `rpc('get_shared_designs')` | not defined in any migration |

## 🔴 Will fail — RPC argument names wrong
| Where | Code sends | Function expects |
|---|---|---|
| `services/clients.ts:144` create_client | `p_client` (one object) | `p_business_name, p_prop_name, p_phone, p_whatsapp, p_email, p_city, p_state, p_cluster, p_address, p_gstin, p_salesperson_id, p_credit_limit, p_payment_terms` |
| `services/clients.ts:190` assign_salesman | `p_salesperson_id` | `p_salesman_id` |
| `services/designs.ts:92` create_design | `p_design` (one object) | `p_article_code, p_name, p_category, p_price, p_moq_pairs, p_moq_cartons, p_sizes, p_colors, p_image, p_subline, p_sole_type, p_upper_material …` |
| `services/designs.ts:151` share_designs | `p_client_id` | `p_design_ids, p_client_ids[], p_channel` |
| `services/orders.ts:163` create_order_draft | `p_order` (one object) | `p_client_id, p_items, p_trade_discount_percent, p_gst_percent, p_advance_deposited, p_expected_delivery, p_notes` |
| `services/orders.ts:184` advance_order_status | `p_new_status, p_manufacturer_id` | `p_order_id, p_to_status, p_note` |
| `services/search.ts:19` global_search | `p_query` | `q` |

## 🟠 Will fail — column names wrong
| Where | Table | Bad column(s) | Real column(s) |
|---|---|---|---|
| `services/notifications.ts:27,63` | notifications | `is_read` | `read_at` (timestamp) |
| `services/activity.ts:59` | activity_events | `entity_type, entity_id, actor_name, actor_role, entity_title, details` | `record_type, record_id, actor, actor_id, summary, metadata` |
| `services/designs.ts:124` | designs | `is_active` | `status` / `archived_at` |
| `services/visits.ts:77` | field_visits | `updated_at` | (column missing — add it or drop from payload) |
| `backend/src/routes/admin.js:48` | profiles | `name, role_label, zone, cluster` | `full_name, role` (zone/cluster live on `sales_team`) |

Note: `customers`, `designs`, `sales_team` use **lowercase-no-underscore** columns (`businessname`, `salespersonid`, `articlecode`, `moqpairs`) while newer tables use snake_case. Any form sending `business_name` / `salesperson_id` to these tables will fail.

## 🟡 Check manually (payload built elsewhere)
`lib/supabase.ts` → customers insert/update, orders, payments, audit_logs, design_shares ·
`services/designs.ts:108` · `services/followUps.ts:59` · `services/manufacturers.ts:54,71` · `services/visits.ts:56`

## ⚠️ Silent fake-save risk
Many services do `if (!supabase) return { success: true, ... }` and `clients.ts:140` returns a fake `cust-<timestamp>` id.
If env vars are missing, **every form shows "Saved" but nothing reaches the database.** Also `lib/supabase.ts` and `services/*` are two parallel data layers.

## Also missing from migrations
- Storage buckets `design-images` and `payment-receipts` (used in `services/storage.ts`) — no bucket creation or storage policies.
- `frontend/src/types/database.types.ts` lists `get_shared_designs`, so the **live DB may differ from the migration files** — the live test must confirm.

## Verified OK
client_notes insert · follow_ups update · orders update · archive_client · request/approve/reject/cancel_discount_request · record_payment · clear_cheque · bounce_cheque · verify_payment · reverse_payment
