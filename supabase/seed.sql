-- ==============================================================================
-- SoleFlow / Shoe Trade CRM - Production Seed Data
-- Idempotent seed script mirroring mockData.ts
-- ==============================================================================

-- 1. SALESMEN
INSERT INTO public.salesmen (
    id, name, phone, email, emp_id, zone, cluster, commission_rate, monthly_target,
    booked_this_month, collection_due, assigned_kit, kit_verified_date, status, created_at, updated_at
) VALUES 
(
    'user-sales', 'Rahul Sharma', '+91 98231 04412', 'rahul.s@soleflow.in', 'SF-REP-08',
    'North Zone', 'Agra & Kanpur Clusters', 4.00, 1840000.00,
    1620000.00, 340000.00, 'AW24 Sneaker Line + Derby Collection', '2024-10-14', 'In Market', NOW() - INTERVAL '60 days', NOW()
),
(
    'rep-2', 'Marcus Vance', '+91 98201 99201', 'marcus.v@soleflow.in', 'SF-REP-02',
    'West Zone', 'Mumbai & Pune Mandi', 4.00, 1520000.00,
    1480000.00, 180000.00, 'Lifestyle Runners & Slip-on Casuals', '2024-10-12', 'In Market', NOW() - INTERVAL '60 days', NOW()
),
(
    'rep-3', 'Priya Singh', '+91 94140 88291', 'priya.s@soleflow.in', 'SF-REP-05',
    'Central Zone', 'Jaipur & Indore', 4.00, 1450000.00,
    1320000.00, 210000.00, 'Formal Derby & Traditional Moccasins', '2024-10-11', 'In Market', NOW() - INTERVAL '60 days', NOW()
),
(
    'rep-4', 'Vikram Patel', '+91 94441 77312', 'vikram.p@soleflow.in', 'SF-REP-11',
    'South Zone', 'Chennai & Bangalore Hubs', 4.00, 1200000.00,
    860000.00, 410000.00, 'All-Terrain Boots & Safety Shoes', '2024-10-09', 'Office/HQ', NOW() - INTERVAL '60 days', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    zone = EXCLUDED.zone,
    cluster = EXCLUDED.cluster,
    commission_rate = EXCLUDED.commission_rate,
    monthly_target = EXCLUDED.monthly_target,
    updated_at = NOW();

-- 2. MANUFACTURERS
INSERT INTO public.manufacturers (
    id, name, location, general_manager, phone, primary_specialization,
    est_year, monthly_capacity_pairs, active_batches_count, on_time_delivery_rate,
    qc_pass_ratio, load_percentage, tooling_lead_time_days, molds_active_count, status, created_at, updated_at
) VALUES
(
    'mfg-1', 'Apex Footwear Works', 'Agra Hub, UP • Est. 2011', 'Satish Gupta', '+91 98290 11223',
    'Vulcanized Sneakers & Strobel Running Shoes', 2011, 8200, 5, 96.40, 99.20, 74, 12, 48, 'Active Plants', NOW() - INTERVAL '90 days', NOW()
),
(
    'mfg-2', 'Metro Leather Crafts', 'Kanpur Industrial Zone, UP', 'Rajesh Mehra', '+91 98391 22880',
    'Goodyear Welt Derby & Oiled Chelsea Boots', 2008, 4500, 4, 94.10, 98.70, 88, 14, 32, 'Near Full', NOW() - INTERVAL '90 days', NOW()
),
(
    'mfg-3', 'Zenith Polyurethanes', 'Dongguan Technical Park • Tooling Hub', 'Kevin Zhang / Amit Saxena', '+86 769 8812 4001',
    'Dual-density EVA Outsoles & Mold Tooling', 2015, 15000, 8, 98.20, 99.60, 65, 14, 64, 'Active Plants', NOW() - INTERVAL '90 days', NOW()
),
(
    'mfg-4', 'Taj Heritage Craft', 'Agra Unit 1 • Traditional Crust Finishing', 'Farhan Mirza', '+91 98370 55190',
    'Italian Hand Crust Patina & Blake Stitching', 2004, 3800, 3, 92.80, 99.00, 62, 10, 24, 'Active Plants', NOW() - INTERVAL '90 days', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    general_manager = EXCLUDED.general_manager,
    phone = EXCLUDED.phone,
    primary_specialization = EXCLUDED.primary_specialization,
    monthly_capacity_pairs = EXCLUDED.monthly_capacity_pairs,
    qc_pass_ratio = EXCLUDED.qc_pass_ratio,
    updated_at = NOW();

-- 3. CLIENTS
INSERT INTO public.clients (
    id, name, contact_person, phone, whatsapp, email, city, state, cluster, address,
    gstin, salesperson_id, payment_terms, credit_limit, tier, status, notes, created_at, updated_at
) VALUES
(
    'cust-1', 'ABC Footwear', 'Ramesh & Sunil Agarwal', '+91 98371 44812', '+91 98765 43210',
    'orders@abcfootwear.com', 'Agra', 'Uttar Pradesh', 'UP West • Hing Ki Mandi',
    'Shop 12, Leather Market Complex, Hing Ki Mandi, Agra - 282003', '09AAACA1234F1Z5',
    'user-sales', '30% Advance + 70% Bilty', 500000.00, 'Tier-1 Wholesale', 'overdue',
    'Long-standing relationship. High order volume, seasonal festive payment delays. Ensure 30% advance on winter boots.',
    NOW() - INTERVAL '120 days', NOW()
),
(
    'cust-2', 'Regal Footwear Hub', 'Vikas Gupta', '+91 98211 88412', '+91 98211 88412',
    'regalshoes.kanpur@gmail.com', 'Kanpur', 'Uttar Pradesh', 'Central UP • Naveen Market',
    'Plot 44, Naveen Market Wholesale Lane, Kanpur - 208001', '09ABDFG9012K1Z3',
    'user-sales', '21 Days Net Bilty', 300000.00, 'Regional Chain', 'overdue',
    'High potential regional retail chain. Consignment dispatch currently on hold pending clearance.',
    NOW() - INTERVAL '100 days', NOW()
),
(
    'cust-3', 'Metro Shoes Franchise', 'Marcus Vance / Branch Manager', '+91 98112 34567', '+91 98112 34567',
    'delhi.cp@metroshoes.net', 'Delhi NCR', 'Delhi', 'Connaught Place & Karol Bagh',
    'Block C-14, Inner Circle, Connaught Place, New Delhi - 110001', '07AAACM9981D1Z1',
    'rep-2', '15 Days Bank Transfer', 1200000.00, 'Tier-1 Wholesale', 'active',
    'Flawless credit history. Premier partner in NCR.',
    NOW() - INTERVAL '150 days', NOW()
),
(
    'cust-4', 'Walkwell Retailers', 'Manjeet Singh', '+91 94140 55219', '+91 94140 55219',
    'manjeet@walkwellretail.com', 'Jaipur', 'Rajasthan', 'MI Road Wholesale Hub',
    'Shop 8, Footwear Plaza, MI Road, Jaipur - 302001', '08AACW7789K1Z4',
    'rep-3', '100% on Bilty Delivery', 400000.00, 'Standard Retail', 'active',
    'Reliable counter sales. High repeat orders for daily trainers.',
    NOW() - INTERVAL '90 days', NOW()
),
(
    'cust-5', 'Elite Soles Co.', 'Sandeep Rathore', '+91 98200 44100', '+91 98200 44100',
    'sandeep@elitesoles.in', 'Mumbai', 'Maharashtra', 'Bandra West & Linking Road',
    'Linking Road Footwear Galleria, Bandra West, Mumbai - 400050', '27AABCE4412M1Z9',
    'rep-4', 'Immediate RTGS', 1500000.00, 'Distributor', 'idle',
    'Bulk regional distributor across Maharashtra.',
    NOW() - INTERVAL '80 days', NOW()
),
(
    'cust-6', 'Bansal Shoe House', 'Kailash Bansal', '+91 97551 22910', '+91 97551 22910',
    'bansalshoes.indore@gmail.com', 'Indore', 'Madhya Pradesh', 'Malwa Wholesale Footwear Complex',
    'Shop 19-21, Malwa Market, Indore - 452002', '23AABCB9901L1Z2',
    'user-sales', '30% Advance + 70% Bilty', 600000.00, 'Regional Chain', 'due_soon',
    'Key retail nexus in central MP.',
    NOW() - INTERVAL '70 days', NOW()
),
(
    'cust-7', 'Kanpur Leather Mart', 'Deepak Soni', '+91 98390 11442', '+91 98390 11442',
    'orders@kanpurleathermart.com', 'Kanpur', 'Uttar Pradesh', 'Naveen Market Central UP',
    'Hing Ki Godown Lane, Naveen Market, Kanpur - 208001', '09AABCK4410H1Z8',
    'user-sales', '21 Days Bilty', 800000.00, 'Tier-1 Wholesale', 'active',
    'Premier buyer for formal Blake stitched footwear.',
    NOW() - INTERVAL '60 days', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    contact_person = EXCLUDED.contact_person,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    email = EXCLUDED.email,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    cluster = EXCLUDED.cluster,
    address = EXCLUDED.address,
    gstin = EXCLUDED.gstin,
    salesperson_id = EXCLUDED.salesperson_id,
    payment_terms = EXCLUDED.payment_terms,
    credit_limit = EXCLUDED.credit_limit,
    tier = EXCLUDED.tier,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 4. DESIGNS
INSERT INTO public.designs (
    id, article_code, name, category, wholesale_price, sample_price, moq_pairs, moq_cartons,
    sizes, colors, tags, sole_type, upper_material, pairs_per_carton, margin_badge, velocity_badge,
    image_url, is_active, status, created_at, updated_at
) VALUES
(
    'sf-1024', 'SF-1024', 'Runner Classic', 'Athletic Sneakers', 1250.00, 1400.00, 60, 5,
    ARRAY[6, 7, 8, 9, 10], ARRAY['Pure White / Cobalt Blue', 'Slate Grey / Neon', 'Triple Black'],
    ARRAY['Bespoke Injection', 'Dual-Density Phylon', '12 Pairs/Master Carton'],
    'Phylon & Molded Rubber Outsole', 'Breathable Engineered Knit & TPU Saddle', 12, 'High Velocity', 'Available',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    TRUE, 'Available', NOW() - INTERVAL '100 days', NOW()
),
(
    'sf-884', 'SF-884', 'Verona Crust Leather Derby', 'Formal Derby & Oxford', 2400.00, 2700.00, 40, 4,
    ARRAY[7, 8, 9, 10, 11], ARRAY['Cognac Tan', 'Deep Espresso', 'Jet Black'],
    ARRAY['Italian Tanning', 'Blake Stitched', '100% Genuine Crust'],
    'Hand-Finished Argentine Vegetable-Tanned Leather Sole', 'Full-Grain European Calfskin Crust', 10, 'High Margin', 'Premium Crust',
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
    TRUE, 'Available', NOW() - INTERVAL '95 days', NOW()
),
(
    'sf-512', 'SF-512', 'Artisan Chelsea Boot', 'Leather Boots', 2850.00, 3200.00, 50, 5,
    ARRAY[7, 8, 9, 10, 11], ARRAY['Oiled Saddle Brown', 'Charcoal Suede', 'Black Box Calf'],
    ARRAY['Goodyear Welt Style', 'Oiled Pull-Up', 'Winterized Tread'],
    'Commando Lugged Rubber Sole with Storm Welt', 'Heavy Oiled Pull-up Leather', 10, 'Trending', 'Oiled Pull-Up',
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80',
    TRUE, 'Popular', NOW() - INTERVAL '90 days', NOW()
),
(
    'sf-204', 'SF-204', 'AeroGlide Knit Runner', 'Athletic Sneakers', 1100.00, 1250.00, 120, 10,
    ARRAY[6, 7, 8, 9, 10], ARRAY['Pitch Black / Mint', 'Arctic White', 'Signal Orange'],
    ARRAY['Dual-density EVA', 'Flyknit Weave', 'High Volume'],
    'Dual-density Cushion EVA Midsole', 'Seamless 3D Knitted Flyknit Upper', 12, 'High Volume', 'Fast Dispatch',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
    TRUE, 'Available', NOW() - INTERVAL '80 days', NOW()
),
(
    'sf-330', 'SF-330', 'Classic Penny Loafer', 'Loafers & Casuals', 1850.00, 2100.00, 60, 6,
    ARRAY[6, 7, 8, 9, 10], ARRAY['Oxblood Cordovan', 'Dark Walnut', 'Navy Suede'],
    ARRAY['Genuine Moccasin', 'Regular Resole', 'Lightweight Flexible'],
    'Flexible Driving Rubber-stud TPR Sole', 'Supple Polished Calfskin Leather', 10, 'High Margin', 'Classic Staple',
    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80',
    TRUE, 'Popular', NOW() - INTERVAL '75 days', NOW()
),
(
    'sf-610', 'SF-610', 'Apex Trail Explorer Cleat', 'Athletic Sneakers', 1450.00, 1650.00, 72, 6,
    ARRAY[7, 8, 9, 10, 11], ARRAY['Forest Khaki', 'Shadow Stealth', 'Desert Dune'],
    ARRAY['Waterproof Gasket', 'Vibram-grade Lug', 'Reinforced Toe'],
    'Anti-slip High-Density TPR Outsole', 'Ripstop Cordura with Hydrophobic Membrane', 12, 'New Release', 'Trending',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    TRUE, 'New Designs', NOW() - INTERVAL '50 days', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    article_code = EXCLUDED.article_code,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    wholesale_price = EXCLUDED.wholesale_price,
    sample_price = EXCLUDED.sample_price,
    moq_pairs = EXCLUDED.moq_pairs,
    moq_cartons = EXCLUDED.moq_cartons,
    sizes = EXCLUDED.sizes,
    colors = EXCLUDED.colors,
    tags = EXCLUDED.tags,
    sole_type = EXCLUDED.sole_type,
    upper_material = EXCLUDED.upper_material,
    pairs_per_carton = EXCLUDED.pairs_per_carton,
    image_url = EXCLUDED.image_url,
    updated_at = NOW();

-- 5. ORDERS
INSERT INTO public.orders (
    id, client_id, salesperson_id, manufacturer_id, status, subtotal, trade_discount_percent,
    trade_discount_amount, taxable_subtotal, gst_percent, gst_amount, net_payable,
    advance_deposited, balance_due, payment_status, expected_delivery, order_date, batch_number,
    created_at, updated_at
) VALUES
(
    'ORD-0148', 'cust-1', 'user-sales', 'mfg-1', 'In Production', 250000.00, 5.00,
    12500.00, 237500.00, 12.00, 28500.00, 266000.00,
    100000.00, 166000.00, 'Advance Deposited', CURRENT_DATE + INTERVAL '16 days', CURRENT_DATE - INTERVAL '17 days', 'SF-902 Urban Trek',
    NOW() - INTERVAL '17 days', NOW()
),
(
    'ORD-0147', 'cust-7', 'user-sales', 'mfg-4', 'Ready to Dispatch', 864000.00, 4.00,
    34560.00, 829440.00, 12.00, 99532.80, 928972.80,
    300000.00, 628972.80, 'Advance Deposited', CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE - INTERVAL '23 days', 'SF-884 Patina Lot',
    NOW() - INTERVAL '23 days', NOW()
),
(
    'ORD-0146', 'cust-3', 'rep-2', 'mfg-1', 'Delivered', 132000.00, 0.00,
    0.00, 132000.00, 12.00, 15840.00, 147840.00,
    147840.00, 0.00, 'Paid', CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE - INTERVAL '28 days', 'SF-204 Flight Lot',
    NOW() - INTERVAL '28 days', NOW()
),
(
    'ORD-0145', 'cust-1', 'user-sales', 'mfg-1', 'Under Review', 576000.00, 5.00,
    28800.00, 547200.00, 12.00, 65664.00, 612864.00,
    382864.00, 230000.00, 'Overdue', CURRENT_DATE - INTERVAL '39 days', CURRENT_DATE - INTERVAL '44 days', 'SF-884 Batch 1',
    NOW() - INTERVAL '44 days', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    client_id = EXCLUDED.client_id,
    salesperson_id = EXCLUDED.salesperson_id,
    manufacturer_id = EXCLUDED.manufacturer_id,
    status = EXCLUDED.status,
    subtotal = EXCLUDED.subtotal,
    trade_discount_percent = EXCLUDED.trade_discount_percent,
    trade_discount_amount = EXCLUDED.trade_discount_amount,
    taxable_subtotal = EXCLUDED.taxable_subtotal,
    gst_percent = EXCLUDED.gst_percent,
    gst_amount = EXCLUDED.gst_amount,
    net_payable = EXCLUDED.net_payable,
    advance_deposited = EXCLUDED.advance_deposited,
    balance_due = EXCLUDED.balance_due,
    payment_status = EXCLUDED.payment_status,
    updated_at = NOW();

-- 6. ORDER ITEMS
INSERT INTO public.order_items (
    id, order_id, design_id, design_name, article_code, rate_per_pair,
    total_pairs, total_cartons, loose_pairs, item_subtotal, size_breakdown
) VALUES
(
    'item-148-1', 'ORD-0148', 'sf-1024', 'Runner Classic', 'SF-1024', 1250.00,
    200, 16, 8, 250000.00,
    '[{"size":6,"pairs":30,"cartons":2,"loose":6},{"size":7,"pairs":50,"cartons":4,"loose":2},{"size":8,"pairs":60,"cartons":5,"loose":0,"isFastMover":true},{"size":9,"pairs":40,"cartons":3,"loose":4},{"size":10,"pairs":20,"cartons":1,"loose":8}]'::jsonb
),
(
    'item-147-1', 'ORD-0147', 'sf-884', 'Verona Crust Leather Derby', 'SF-884', 2400.00,
    360, 30, 0, 864000.00,
    '[{"size":7,"pairs":60,"cartons":6,"loose":0},{"size":8,"pairs":120,"cartons":12,"loose":0,"isFastMover":true},{"size":9,"pairs":120,"cartons":12,"loose":0},{"size":10,"pairs":60,"cartons":6,"loose":0}]'::jsonb
),
(
    'item-146-1', 'ORD-0146', 'sf-204', 'AeroGlide Knit Runner', 'SF-204', 1100.00,
    120, 10, 0, 132000.00,
    '[{"size":7,"pairs":30,"cartons":2,"loose":6},{"size":8,"pairs":40,"cartons":3,"loose":4},{"size":9,"pairs":30,"cartons":2,"loose":6},{"size":10,"pairs":20,"cartons":1,"loose":8}]'::jsonb
),
(
    'item-145-1', 'ORD-0145', 'sf-884', 'Verona Derby & Runners', 'SF-884/1024', 1800.00,
    320, 26, 8, 576000.00,
    '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    rate_per_pair = EXCLUDED.rate_per_pair,
    total_pairs = EXCLUDED.total_pairs,
    total_cartons = EXCLUDED.total_cartons,
    loose_pairs = EXCLUDED.loose_pairs,
    item_subtotal = EXCLUDED.item_subtotal,
    size_breakdown = EXCLUDED.size_breakdown;

-- 7. ORDER STATUS HISTORY
INSERT INTO public.order_status_history (order_id, from_status, to_status, note, changed_by)
VALUES
('ORD-0148', 'Draft', 'Under Review', 'Order submitted by sales rep Rahul Sharma', 'user-sales'),
('ORD-0148', 'Under Review', 'Approved', 'Credit terms approved by Ajay Sharma', 'user-admin'),
('ORD-0148', 'Approved', 'In Production', 'Sent to Apex Footwear Works Unit 2', 'user-admin'),
('ORD-0147', 'Draft', 'Approved', 'Direct approval by admin', 'user-admin'),
('ORD-0147', 'Approved', 'In Production', 'Production started at Taj Heritage Craft', 'user-admin'),
('ORD-0147', 'In Production', 'Ready to Dispatch', 'Passed 100% quality inspection check', 'user-admin'),
('ORD-0146', 'Draft', 'Delivered', 'Order completed and delivered to Connaught Place store', 'user-admin')
ON CONFLICT DO NOTHING;

-- 8. PAYMENTS
INSERT INTO public.payments (
    id, client_id, amount, payment_mode, reference_no, payment_date, notes,
    salesperson_id, recorded_by, created_at, updated_at
) VALUES
(
    'PAY-00931', 'cust-1', 100000.00, 'NEFT', 'HDFC99823614', CURRENT_DATE - INTERVAL '1 day',
    'Direct NEFT credit into HDFC Trade Account. Adjusted against invoice INV-0144.', 'user-sales', 'user-sales',
    NOW() - INTERVAL '1 day', NOW()
),
(
    'PAY-00930', 'cust-2', 50000.00, 'Cheque', 'CHQ-402911', CURRENT_DATE - INTERVAL '25 days',
    'Cheque #402911 deposited in Kanpur ICICI branch.', 'user-sales', 'user-sales',
    NOW() - INTERVAL '25 days', NOW()
),
(
    'PAY-00929', 'cust-3', 340000.00, 'RTGS', 'RTGS-DEL-88192', CURRENT_DATE - INTERVAL '17 days',
    'Full settlement for bulk festival consignment.', 'rep-2', 'rep-2',
    NOW() - INTERVAL '17 days', NOW()
),
(
    'PAY-00928', 'cust-4', 85000.00, 'UPI', 'UPI-9812401823', CURRENT_DATE - INTERVAL '20 days',
    'On-delivery bilty settlement.', 'rep-3', 'rep-3',
    NOW() - INTERVAL '20 days', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount,
    payment_mode = EXCLUDED.payment_mode,
    reference_no = EXCLUDED.reference_no,
    updated_at = NOW();

-- 9. PAYMENT ALLOCATIONS
INSERT INTO public.payment_allocations (
    id, payment_id, order_id, amount, allocated_by
) VALUES
(
    'alloc-1', 'PAY-00931', 'ORD-0148', 100000.00, 'user-sales'
),
(
    'alloc-2', 'PAY-00930', 'ORD-0147', 50000.00, 'user-sales'
),
(
    'alloc-3', 'PAY-00929', 'ORD-0146', 147840.00, 'rep-2'
)
ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount;

-- 10. CLIENT NOTES
INSERT INTO public.client_notes (id, client_id, note, author_id, created_at)
VALUES
(
    'cn-1', 'cust-1', 'Long-standing relationship. High order volume, seasonal festive payment delays. Ensure 30% advance on winter boots.', 'user-admin', NOW() - INTERVAL '30 days'
),
(
    'cn-2', 'cust-2', '42 Cartons (Packed) at godown. Dispatch blocked until ₹1.15L overdue is cleared.', 'user-admin', NOW() - INTERVAL '27 days'
)
ON CONFLICT (id) DO NOTHING;

-- 11. FOLLOW UPS
INSERT INTO public.follow_ups (
    id, client_id, salesperson_id, order_id, reason, due_date, due_time, amount_due, notes, status, created_at, updated_at
) VALUES
(
    'fol-1', 'cust-1', 'user-sales', 'ORD-0145', 'Payment follow-up for overdue ledger balance', CURRENT_DATE, '11:00:00', 230000.00,
    'Speak to Sunil Agarwal about clearing remaining ₹2.30L to release 320 pairs.', 'today', NOW() - INTERVAL '2 days', NOW()
),
(
    'fol-2', 'cust-2', 'user-sales', 'ORD-0147', 'Winter boot catalog volume discount review', CURRENT_DATE, '15:45:00', 115000.00,
    'Review pending ₹60k before committing extra 40 pairs allocation.', 'today', NOW() - INTERVAL '2 days', NOW()
),
(
    'fol-3', 'cust-4', 'rep-3', NULL, 'Diwali Festival season bulk booking for Oxford line', CURRENT_DATE + INTERVAL '1 day', '16:00:00', 15000.00,
    'Target 15 cartons minimum for seasonal priority freight.', 'upcoming', NOW() - INTERVAL '1 day', NOW()
),
(
    'fol-4', 'cust-6', 'user-sales', 'ORD-0148', 'Verify dispatch tracking LR #88921-AGR arrival', CURRENT_DATE + INTERVAL '3 days', '14:00:00', 166000.00,
    'Confirm consignment unloading and inspect condition.', 'upcoming', NOW() - INTERVAL '1 day', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    reason = EXCLUDED.reason,
    due_date = EXCLUDED.due_date,
    due_time = EXCLUDED.due_time,
    amount_due = EXCLUDED.amount_due,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 12. FIELD VISITS
INSERT INTO public.field_visits (
    id, client_id, salesperson_id, location, visit_date, visit_time, purpose,
    outcome, notes, status, verified_gps, created_at, updated_at
) VALUES
(
    'vis-1', 'cust-3', 'user-sales', 'Shop 14, Main Shoe Market, Hing Ki Mandi, Agra', CURRENT_DATE, '10:30:00',
    'Sample showing: AW24 Sneaker Line & Runner Classic', 'Order Created', 'Booked order ORD-0149 for 200 pairs. Owner agreed on 21-day terms.', 'completed', TRUE,
    NOW() - INTERVAL '4 hours', NOW()
),
(
    'vis-2', 'cust-1', 'user-sales', 'Shop 12, Leather Market Complex, Agra', CURRENT_DATE, '13:15:00',
    'Cheque Collection & Ledger Reconciliation', 'Payment Collected', 'Collected ₹1,00,000 Cheque #044192. Deposited into HDFC Bank.', 'completed', TRUE,
    NOW() - INTERVAL '2 hours', NOW()
),
(
    'vis-3', 'cust-2', 'user-sales', 'Naveen Market Wholesale Lane, Kanpur', CURRENT_DATE, '15:45:00',
    'Winter boot bulk booking & balance clearance', NULL, 'Meet Vikas Gupta in person at shop.', 'today', FALSE,
    NOW() - INTERVAL '1 hour', NOW()
),
(
    'vis-4', 'cust-4', 'rep-3', 'MI Road Wholesale Hub, Jaipur', CURRENT_DATE, '17:30:00',
    'Festival stock intake review', NULL, 'Demonstrate new TPR cleat outsole flexibility.', 'today', FALSE,
    NOW() - INTERVAL '30 mins', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    outcome = EXCLUDED.outcome,
    notes = EXCLUDED.notes,
    status = EXCLUDED.status,
    verified_gps = EXCLUDED.verified_gps,
    updated_at = NOW();

-- 13. NOTIFICATIONS
INSERT INTO public.notifications (
    id, title, description, category, link_tab, is_read, target_user_id, created_at
) VALUES
(
    'notif-1', 'ABC Footwear: Balance Overdue 18 Days (₹2,30,000)',
    'Critical credit cap exceeded. Order ORD-0145 dispatch held at central dock.',
    'alert', 'payments', FALSE, 'user-admin', NOW() - INTERVAL '4 minutes'
),
(
    'notif-2', 'Metro Shoes Delhi requested 9.5% Special Margin (+1.5%)',
    'PO-8820 for 900 pairs requires Admin approval before transmitting to factory.',
    'order', 'reports', FALSE, 'user-admin', NOW() - INTERVAL '22 minutes'
),
(
    'notif-3', 'Assembly Floor Alert: Sole Injection Line 3 Maint.',
    'Batch #B-9021 Verona Derby shifted +2 days at Apex Works Agra Unit 2.',
    'factory', 'manufacturers', FALSE, 'user-admin', NOW() - INTERVAL '1 hour'
),
(
    'notif-4', 'Rahul Sharma completed Hing Ki Mandi Visit 1',
    'Booked ORD-0149 (200 Pairs) and collected ₹1.00L Cheque #044192.',
    'visit', 'sales-team', FALSE, 'user-admin', NOW() - INTERVAL '2 hours'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_read = EXCLUDED.is_read;

-- 14. DESIGN SHARES & ITEMS
INSERT INTO public.design_shares (
    id, share_token, client_id, shared_by, channel, view_count, last_viewed_at, created_at, updated_at
) VALUES
(
    'dshare-1', 'token-abc-001', 'cust-1', 'user-sales', 'WhatsApp', 4, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 day', NOW()
),
(
    'dshare-2', 'token-reg-002', 'cust-2', 'user-sales', 'WhatsApp', 2, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '2 days', NOW()
),
(
    'dshare-3', 'token-met-003', 'cust-3', 'user-admin', 'Direct Link', 7, NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 days', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    view_count = EXCLUDED.view_count,
    last_viewed_at = EXCLUDED.last_viewed_at;

INSERT INTO public.design_share_items (share_id, design_id, display_order)
VALUES
('dshare-1', 'sf-1024', 1),
('dshare-1', 'sf-884', 2),
('dshare-1', 'sf-512', 3),
('dshare-2', 'sf-1024', 1),
('dshare-3', 'sf-1024', 1),
('dshare-3', 'sf-884', 2),
('dshare-3', 'sf-512', 3),
('dshare-3', 'sf-610', 4)
ON CONFLICT DO NOTHING;

-- 15. ACTIVITY EVENTS
INSERT INTO public.activity_events (
    id, actor_id, actor_name, actor_role, entity_type, entity_id, entity_title, action, details, source, created_at
) VALUES
(
    'act-seed-1', 'user-admin', 'Ajay Sharma', 'Trader / Admin', 'Order', 'ORD-0148',
    'ABC Footwear (420 Pairs)', 'Approved Wholesale Order',
    '{"oldValue": "Status: Under Review", "newValue": "Status: Approved (Assigned to Apex Footwear Works Unit 3)"}'::jsonb,
    'Web App', NOW() - INTERVAL '4 hours'
),
(
    'act-seed-2', 'user-sales', 'Rahul Sharma', 'Field Sales Rep', 'Payment', 'PAY-00931',
    'ABC Footwear - ₹1,00,000 NEFT', 'Recorded Payment Collection',
    '{"oldValue": "Customer Due: ₹2,30,000", "newValue": "Customer Due: ₹1,30,000 (UTR HDFC99823614)"}'::jsonb,
    'Mobile App', NOW() - INTERVAL '2 hours'
),
(
    'act-seed-3', 'user-admin', 'Ajay Sharma', 'Trader / Admin', 'Manufacturer', 'mfg-1',
    'Apex Footwear Works (Agra Plant)', 'Assigned Manufacturing Facility',
    '{"oldValue": "Active Batches: 8", "newValue": "Active Batches: 9 (Batch SF-903 Allocated)"}'::jsonb,
    'Web App', NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- 16. APP SETTINGS
INSERT INTO public.app_settings (key, value, description)
VALUES
('company_info', '{"name": "SoleFlow Footwear Trading", "tagline": "Agra Wholesale Shoe Hub", "gstin": "09AAAAA0000A1Z5", "phone": "+91 98765 43210", "email": "contact@soleflow.in", "address": "Sikandra Industrial Area, Agra, UP - 282007"}'::jsonb, 'Company branding and billing details'),
('default_rates', '{"default_gst_percent": 12, "default_commission_rate": 4, "default_trade_discount": 5}'::jsonb, 'Default commercial rates and taxes')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();
