-- PoshanSetu Initial Schema Migration
-- 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- A. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'requester', 'institution', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);

-- B. DISTRICTS
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_districts_slug ON districts(slug);

-- C. NUTRITION INDICATORS
CREATE TABLE IF NOT EXISTS nutrition_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    indicator_name VARCHAR(255) NOT NULL,
    indicator_value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    reporting_period VARCHAR(100) NOT NULL,
    data_year INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, indicator_name, source_name, reporting_period)
);

CREATE TRIGGER update_nutrition_indicators_updated_at BEFORE UPDATE ON nutrition_indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_nutrition_indicators_district_id ON nutrition_indicators(district_id);

-- D. FOOD CATEGORIES / FOOD REFERENCE DATA
CREATE TABLE IF NOT EXISTS food_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_food_categories_updated_at BEFORE UPDATE ON food_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES food_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    nutritional_attributes JSONB DEFAULT '{}', -- Store informational attributes safely
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_food_items_updated_at BEFORE UPDATE ON food_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- E. INSTITUTIONS
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100) NOT NULL,
    description TEXT,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'under_review')),
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- F. REQUIREMENTS
CREATE TABLE IF NOT EXISTS requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    district_id UUID NOT NULL REFERENCES districts(id),
    taluka VARCHAR(100),
    address TEXT,
    landmark TEXT,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    beneficiary_count INTEGER NOT NULL CHECK (beneficiary_count > 0),
    beneficiary_description TEXT,
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(20) NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'active', 'partially_supported', 'fulfilled', 'expired', 'rejected', 'hidden')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_requirements_district_id ON requirements(district_id);
CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_requirements_urgency ON requirements(urgency);
CREATE INDEX idx_requirements_expires_at ON requirements(expires_at);
CREATE INDEX idx_requirements_requester_user_id ON requirements(requester_user_id);

-- G. REQUIREMENT ITEMS
CREATE TABLE IF NOT EXISTS requirement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity_required DECIMAL(10, 2) NOT NULL CHECK (quantity_required > 0),
    quantity_remaining DECIMAL(10, 2) NOT NULL CHECK (quantity_remaining >= 0),
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_requirement_items_updated_at BEFORE UPDATE ON requirement_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_requirement_items_requirement_id ON requirement_items(requirement_id);

-- H. SUPPORT OFFERS
CREATE TABLE IF NOT EXISTS support_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    donor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity_offered DECIMAL(10, 2) NOT NULL CHECK (quantity_offered > 0),
    unit VARCHAR(50) NOT NULL,
    donor_message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_support_offers_updated_at BEFORE UPDATE ON support_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_support_offers_requirement_id ON support_offers(requirement_id);
CREATE INDEX idx_support_offers_donor_user_id ON support_offers(donor_user_id);

-- I. SUPPORT CONFIRMATIONS
CREATE TABLE IF NOT EXISTS support_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    support_offer_id UUID NOT NULL REFERENCES support_offers(id) ON DELETE CASCADE,
    confirmed_by_donor BOOLEAN DEFAULT FALSE,
    donor_confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by_requester BOOLEAN DEFAULT FALSE,
    requester_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(support_offer_id)
);

CREATE TRIGGER update_support_confirmations_updated_at BEFORE UPDATE ON support_confirmations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- J. INSTITUTION DOCUMENTS
CREATE TABLE IF NOT EXISTS institution_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'cloudinary',
    storage_public_id TEXT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER,
    review_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_institution_documents_updated_at BEFORE UPDATE ON institution_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_institution_documents_institution_id ON institution_documents(institution_id);

-- K. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);

-- L. ADMIN / FRAUD REVIEW
CREATE TABLE IF NOT EXISTS fraud_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    signal_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_fraud_signals_entity ON fraud_signals(entity_type, entity_id);
CREATE INDEX idx_fraud_signals_status ON fraud_signals(status);

CREATE TABLE IF NOT EXISTS admin_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    decision VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
