-- ==========================================================
-- Water Supply Management System
-- Schema v1.0
-- PostgreSQL
-- ==========================================================

-- ==========================================================
-- USERS
-- ==========================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    business_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,

    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    phone VARCHAR(20),

    profile_picture TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- BUSINESS SETTINGS
-- ==========================================================

CREATE TABLE business_settings (
    id BIGSERIAL PRIMARY KEY,

    business_name VARCHAR(150) NOT NULL,

    phone VARCHAR(20),

    email VARCHAR(100),

    address TEXT,

    logo TEXT,

    theme_color VARCHAR(20) DEFAULT '#2563EB',

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- CUSTOMERS
-- ==========================================================

CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,

    customer_code VARCHAR(20) UNIQUE NOT NULL,

    name VARCHAR(100) NOT NULL,

    phone VARCHAR(20),

    address TEXT NOT NULL,

    latitude NUMERIC(10,7),

    longitude NUMERIC(10,7),

    active BOOLEAN DEFAULT TRUE,

    joined_date DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PRODUCTS
-- ==========================================================

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,

    product_name VARCHAR(100) NOT NULL,

    volume INTEGER NOT NULL,

    unit VARCHAR(20) NOT NULL,

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- ORDERS
-- ==========================================================

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,

    order_number VARCHAR(30) UNIQUE NOT NULL,

    customer_id BIGINT NOT NULL,

    status VARCHAR(20)
        DEFAULT 'Pending'
        CHECK (status IN ('Pending','Delivered','Cancelled')),

    remarks TEXT,

    ordered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    delivered_at TIMESTAMPTZ,

    CONSTRAINT fk_customer
        FOREIGN KEY(customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE
);

-- ==========================================================
-- ORDER ITEMS
-- ==========================================================

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,

    order_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    quantity INTEGER NOT NULL CHECK(quantity > 0),

    CONSTRAINT fk_order
        FOREIGN KEY(order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product
        FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX idx_customer_code
ON customers(customer_code);

CREATE INDEX idx_customer_name
ON customers(name);

CREATE INDEX idx_customer_phone
ON customers(phone);

CREATE INDEX idx_orders_customer
ON orders(customer_id);

CREATE INDEX idx_orders_status
ON orders(status);

CREATE INDEX idx_orders_date
ON orders(ordered_at);

CREATE INDEX idx_products_name
ON products(product_name);