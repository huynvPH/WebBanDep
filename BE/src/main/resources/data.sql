INSERT INTO profiles (id, created_at, email, full_name, username, password) VALUES
('b3f1e94a-8d14-41d4-a716-446655440001', CURRENT_TIMESTAMP, 'admin@solecharm.com', 'Admin User', 'admin', '123456'),
('b3f1e94a-8d14-41d4-a716-446655440002', CURRENT_TIMESTAMP, 'staff@solecharm.com', 'Staff Member', 'staff', '123456'),
('b3f1e94a-8d14-41d4-a716-446655440003', CURRENT_TIMESTAMP, 'customer@solecharm.com', 'Nguyen Van Khach Hang', 'customer', '123456');

INSERT INTO user_roles (id, created_at, role, user_id) VALUES
(random_uuid(), CURRENT_TIMESTAMP, 'admin', 'b3f1e94a-8d14-41d4-a716-446655440001'),
(random_uuid(), CURRENT_TIMESTAMP, 'staff', 'b3f1e94a-8d14-41d4-a716-446655440002'),
(random_uuid(), CURRENT_TIMESTAMP, 'customer', 'b3f1e94a-8d14-41d4-a716-446655440003');

INSERT INTO products (id, active, category, color, created_at, description, name, price, size, sku, stock) VALUES
('c3f1e94a-8d14-41d4-a716-446655440001', 1, 'clog', 'Black', CURRENT_TIMESTAMP, 'Classic Black Clog', 'Crocs Classic Black', 1200000, '39', 'CLOG-BLK-39', 70),
('c3f1e94a-8d14-41d4-a716-446655440002', 1, 'clog', 'White', CURRENT_TIMESTAMP, 'Classic White Clog', 'Crocs Classic White', 1200000, '40', 'CLOG-WHT-40', 45),
('c3f1e94a-8d14-41d4-a716-446655440003', 1, 'charm', 'Multi', CURRENT_TIMESTAMP, 'Cute animal charm', 'Animal Charm Pack', 150000, NULL, 'CHM-ANI-01', 150),
('c3f1e94a-8d14-41d4-a716-446655440004', 1, 'clog', 'Pink', CURRENT_TIMESTAMP, 'Soft pink sandal', 'Crocs Classic Pink', 1300000, '38', 'CLOG-PNK-38', 50),
('c3f1e94a-8d14-41d4-a716-446655440005', 1, 'clog', 'Blue', CURRENT_TIMESTAMP, 'Ocean blue comfortable clog', 'Crocs Ocean Blue', 1250000, '41', 'CLOG-BLU-41', 45),
('c3f1e94a-8d14-41d4-a716-446655440006', 1, 'clog', 'Green', CURRENT_TIMESTAMP, 'Mint green summer style', 'Crocs Mint Green', 1350000, '39', 'CLOG-GRN-39', 90),
('c3f1e94a-8d14-41d4-a716-446655440007', 1, 'clog', 'Yellow', CURRENT_TIMESTAMP, 'Bright yellow sandal', 'Crocs Sunshine Yellow', 1400000, '37', 'CLOG-YEL-37', 25),
('c3f1e94a-8d14-41d4-a716-446655440008', 1, 'clog', 'Red', CURRENT_TIMESTAMP, 'Vibrant red casual sandal', 'Crocs Pepper Red', 1250000, '42', 'CLOG-RED-42', 47),
('c3f1e94a-8d14-41d4-a716-446655440009', 1, 'charm', 'Gold', CURRENT_TIMESTAMP, 'Golden star jibbitz', 'Star Jibbitz Gold', 120000, NULL, 'CHM-STR-GLD', 230),
('c3f1e94a-8d14-41d4-a716-446655440010', 1, 'charm', 'Silver', CURRENT_TIMESTAMP, 'Silver moon jibbitz', 'Moon Jibbitz Silver', 120000, NULL, 'CHM-MON-SLV', 300),
('c3f1e94a-8d14-41d4-a716-446655440011', 1, 'clog', 'Grey', CURRENT_TIMESTAMP, 'Slate grey work clog', 'Crocs Slate Grey', 1150000, '43', 'CLOG-GRY-43', 23),
('c3f1e94a-8d14-41d4-a716-446655440012', 1, 'clog', 'Purple', CURRENT_TIMESTAMP, 'Lavender purple casual clog', 'Crocs Lavender', 1300000, '38', 'CLOG-PUR-38', 63),
('c3f1e94a-8d14-41d4-a716-446655440013', 1, 'clog', 'Orange', CURRENT_TIMESTAMP, 'Tangerine orange bright clog', 'Crocs Tangerine', 1350000, '40', 'CLOG-ORG-40', 42);

INSERT INTO product_images (product_id, image_url) VALUES
('c3f1e94a-8d14-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440007', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440009', 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440010', 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440011', 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440012', 'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=600&q=80'),
('c3f1e94a-8d14-41d4-a716-446655440013', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80');


INSERT INTO vouchers (id, active, code, created_at, discount_type, discount_value, expires_at, min_order, usage_limit, used_count) VALUES
('d3f1e94a-8d14-41d4-a716-446655440001', 1, 'WELCOME50', CURRENT_TIMESTAMP, 'fixed', 50000, '2027-12-31 23:59:59', 500000, 1000, 15),
('d3f1e94a-8d14-41d4-a716-446655440002', 1, 'SALE10', CURRENT_TIMESTAMP, 'percent', 10, '2027-12-31 23:59:59', 1000000, 500, 50);

INSERT INTO orders (id, created_at, customer_name, customer_phone, delivery_method, payment_method, payment_status, status, total_amount, type, user_id, voucher_id, shipping_address) VALUES
('e3f1e94a-8d14-41d4-a716-446655440001', CURRENT_TIMESTAMP, 'Nguyen Van Khach Hang', '0987654321', 'home', 'cod', 'pending', 'pending', 1200000, 'online', 'b3f1e94a-8d14-41d4-a716-446655440003', NULL, '123 Le Loi, Q1, HCM'),
('e3f1e94a-8d14-41d4-a716-446655440002', CURRENT_TIMESTAMP, 'Khach Mua Truc Tiep', NULL, 'pickup', 'cash', 'paid', 'completed', 150000, 'pos', NULL, NULL, NULL);

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price) VALUES
(random_uuid(), 'e3f1e94a-8d14-41d4-a716-446655440001', 'c3f1e94a-8d14-41d4-a716-446655440001', 'Crocs Classic Black', 1, 1200000),
(random_uuid(), 'e3f1e94a-8d14-41d4-a716-446655440002', 'c3f1e94a-8d14-41d4-a716-446655440003', 'Animal Charm Pack', 1, 150000);
