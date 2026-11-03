-- ============================================================================
-- MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — RELATIONAL DATABASE SCHEMA
-- Target RDBMS: PostgreSQL 15+ (with PostGIS extension for spatial queries)
-- ============================================================================

-- 1. ENUMERATED TYPES
CREATE TYPE user_role AS ENUM ('farmer', 'logistics', 'mill');
CREATE TYPE trip_status AS ENUM ('open', 'bidding', 'awarded', 'in_transit', 'delivered', 'settled');
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE enso_intensity AS ENUM ('Neutral', 'Weak', 'Moderate', 'Strong', 'Very Strong');
CREATE TYPE rainfall_category AS ENUM ('Deficient', 'Normal', 'Excess');

-- 2. CORE USERS & AUTHENTICATION TABLE
CREATE TABLE users (
    user_id VARCHAR(32) PRIMARY KEY,
    role user_role NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120),
    password_hash TEXT NOT NULL,
    district VARCHAR(60) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROLE-SPECIFIC PROFILE TABLES
CREATE TABLE farmer_profiles (
    farmer_id VARCHAR(32) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    kisan_reg_no VARCHAR(40) NOT NULL UNIQUE,
    taluka VARCHAR(60) NOT NULL,
    village VARCHAR(80) NOT NULL,
    default_lat NUMERIC(9, 6) NOT NULL,
    default_lng NUMERIC(9, 6) NOT NULL,
    cultivable_area_ha NUMERIC(6, 2) NOT NULL DEFAULT 2.50,
    primary_cane_variety VARCHAR(40) DEFAULT 'Co 86032'
);

CREATE TABLE transporter_profiles (
    transporter_id VARCHAR(32) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    agency_name VARCHAR(120) NOT NULL,
    permit_license_no VARCHAR(50) NOT NULL UNIQUE,
    vehicle_reg_no VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(60) NOT NULL,
    max_payload_mt NUMERIC(5, 2) NOT NULL DEFAULT 25.00,
    rating NUMERIC(3, 2) DEFAULT 4.80
);

CREATE TABLE mill_profiles (
    mill_id VARCHAR(32) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    mill_name VARCHAR(140) NOT NULL,
    iem_license_no VARCHAR(50) NOT NULL UNIQUE,
    commissionerate_zone VARCHAR(60) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    crushing_capacity_tcd INTEGER NOT NULL DEFAULT 5000,
    distillery_capacity_klpd INTEGER NOT NULL DEFAULT 60,
    base_frp_per_mt NUMERIC(8, 2) NOT NULL DEFAULT 3400.00
);

-- 4. FARMER PLOTS & HARVEST TRANSPORT REQUESTS
CREATE TABLE transport_trips (
    trip_id VARCHAR(32) PRIMARY KEY,
    farmer_id VARCHAR(32) NOT NULL REFERENCES farmer_profiles(farmer_id),
    farmer_name VARCHAR(120) NOT NULL,
    plot_address TEXT NOT NULL,
    district VARCHAR(60) NOT NULL,
    plot_lat NUMERIC(9, 6) NOT NULL,
    plot_lng NUMERIC(9, 6) NOT NULL,
    target_mill_id VARCHAR(32) NOT NULL,
    target_mill_name VARCHAR(140) NOT NULL,
    mill_lat NUMERIC(9, 6) NOT NULL,
    mill_lng NUMERIC(9, 6) NOT NULL,
    cane_variety VARCHAR(40) NOT NULL,
    crop_season_type VARCHAR(40) NOT NULL,
    quantity_mt NUMERIC(8, 2) NOT NULL,
    quantity_quintals NUMERIC(10, 2) GENERATED ALWAYS AS (quantity_mt * 10.0) STORED,
    harvest_date DATE NOT NULL,
    harvest_window VARCHAR(40) NOT NULL,
    estimated_distance_km NUMERIC(7, 2) NOT NULL,
    estimated_transit_mins INTEGER NOT NULL,
    highway_corridor VARCHAR(80),
    status trip_status NOT NULL DEFAULT 'open',
    awarded_bid_id VARCHAR(32),
    awarded_fare_inr NUMERIC(10, 2),
    gate_pass_code VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. LOGISTICS TRANSPORTER BIDS
CREATE TABLE transporter_bids (
    bid_id VARCHAR(32) PRIMARY KEY,
    trip_id VARCHAR(32) NOT NULL REFERENCES transport_trips(trip_id) ON DELETE CASCADE,
    transporter_id VARCHAR(32) NOT NULL,
    transporter_name VARCHAR(120) NOT NULL,
    vehicle_type VARCHAR(60) NOT NULL,
    vehicle_reg_no VARCHAR(30) NOT NULL,
    proposed_fare_inr NUMERIC(10, 2) NOT NULL,
    rate_per_mt_inr NUMERIC(8, 2) NOT NULL,
    eta_pickup_hrs NUMERIC(4, 1) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.75,
    notes TEXT,
    status bid_status NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SUGAR MILL WEIGHBRIDGE & LAB QUALITY BATCH PRICING LEDGER
CREATE TABLE weighbridge_batches (
    batch_id VARCHAR(32) PRIMARY KEY,
    trip_id VARCHAR(32) REFERENCES transport_trips(trip_id),
    farmer_name VARCHAR(120) NOT NULL,
    cane_variety VARCHAR(40) NOT NULL,
    gross_weight_mt NUMERIC(8, 3) NOT NULL,
    tare_weight_mt NUMERIC(8, 3) NOT NULL,
    raw_cane_mt NUMERIC(8, 3) NOT NULL,
    trash_deduction_pct NUMERIC(5, 2) NOT NULL,
    net_payable_mt NUMERIC(8, 3) NOT NULL,
    pol_pct NUMERIC(5, 2) NOT NULL,
    brix_pct NUMERIC(5, 2) NOT NULL,
    purity_pct NUMERIC(5, 2) NOT NULL,
    estimated_recovery_pct NUMERIC(5, 2) NOT NULL,
    reducing_sugars_pct NUMERIC(5, 2) NOT NULL,
    dextran_ppm INTEGER NOT NULL,
    base_frp_per_mt NUMERIC(8, 2) NOT NULL,
    recovery_premium_per_mt NUMERIC(8, 2) NOT NULL,
    quality_adj_per_mt NUMERIC(8, 2) NOT NULL,
    final_rate_per_mt NUMERIC(8, 2) NOT NULL,
    total_payable_inr NUMERIC(12, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SUGAR MILL ANNUAL MASS BALANCE & PRODUCTION ANALYTICS
CREATE TABLE mill_annual_mass_balance (
    record_year INTEGER PRIMARY KEY,
    cane_crushed_mt NUMERIC(12, 2) NOT NULL,
    sugar_produced_mt NUMERIC(12, 2) NOT NULL,
    ethanol_produced_kl NUMERIC(12, 2) NOT NULL,
    bagasse_generated_mt NUMERIC(12, 2) NOT NULL,
    molasses_produced_mt NUMERIC(12, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MACRO CLIMATE & PRODUCTION ANALYTICAL TABLES (LANDING PORTAL)
CREATE TABLE macro_enso_anomalies (
    obs_year INTEGER PRIMARY KEY,
    oni_peak_c NUMERIC(4, 2) NOT NULL,
    status_badge VARCHAR(40) NOT NULL,
    intensity_category enso_intensity NOT NULL,
    regional_correlation TEXT NOT NULL
);

CREATE TABLE macro_maharashtra_rainfall (
    obs_year VARCHAR(16) PRIMARY KEY,
    total_rainfall_mm NUMERIC(7, 1) NOT NULL,
    baseline_mm NUMERIC(7, 1) NOT NULL DEFAULT 1152.7,
    pct_deviation NUMERIC(6, 2) NOT NULL,
    category rainfall_category NOT NULL
);

CREATE TABLE macro_sugar_trends (
    season VARCHAR(16) PRIMARY KEY,
    production_lmt NUMERIC(7, 2) NOT NULL,
    baseline_lmt NUMERIC(7, 2) NOT NULL DEFAULT 90.00,
    pct_deviation NUMERIC(6, 2) NOT NULL,
    analytical_notes TEXT NOT NULL
);

CREATE TABLE macro_ethanol_trends (
    season VARCHAR(16) PRIMARY KEY,
    production_cr_litres NUMERIC(7, 2) NOT NULL,
    baseline_cr_litres NUMERIC(7, 2) NOT NULL DEFAULT 120.00,
    pct_deviation NUMERIC(6, 2) NOT NULL,
    policy_impact_notes TEXT NOT NULL
);
