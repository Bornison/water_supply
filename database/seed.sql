-- ==========================================================
-- BUSINESS SETTINGS
-- ==========================================================

INSERT INTO business_settings
(
business_name,
phone,
email,
address
)

VALUES
(
'Bashi Khong Water Supply',
'98XXXXXXXX',
'',
''
);

-- ==========================================================
-- DEFAULT OWNER
-- ==========================================================

INSERT INTO users
(
business_name,
owner_name,
username,
password,
phone
)

VALUES
(
'BashiKhong Water',
'Administrator',
'Hanao',
'admin123',
'98XXXXXXXX'
);

-- ==========================================================
-- DEFAULT PRODUCTS
-- ==========================================================

INSERT INTO products
(product_name, volume, unit)

VALUES

('20L Jar',20,'Liter'),

('10L Jar',10,'Liter'),

('2L Bottle',2,'Liter'),

('1L Bottle',1,'Liter'),

('750ml Bottle',750,'Milliliter');