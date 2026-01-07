-- migration: create_tables.sql

-- 1. Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    api_secret VARCHAR(64) NOT NULL,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY, -- Format: order_ + 16 alphanumeric characters
    merchant_id UUID REFERENCES merchants(id) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 100), -- Amount in smallest unit (min 100)
    currency VARCHAR(3) DEFAULT 'INR',
    receipt VARCHAR(255),
    notes JSONB,
    status VARCHAR(20) DEFAULT 'created',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY, -- Format: pay_ + 16 alphanumeric characters
    order_id VARCHAR(64) REFERENCES orders(id) NOT NULL,
    merchant_id UUID REFERENCES merchants(id) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    method VARCHAR(20) NOT NULL, -- 'upi' or 'card'
    status VARCHAR(20) DEFAULT 'created',
    vpa VARCHAR(255), -- Only for UPI
    card_network VARCHAR(20), -- For Card
    card_last4 VARCHAR(4), -- For Card
    error_code VARCHAR(50),
    error_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Required Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);