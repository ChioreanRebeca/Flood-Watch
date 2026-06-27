-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Never store plain text passwords in production!
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Monitored Locations (POIs) Table
CREATE TABLE user_pois (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crowdsourced Reports Table
CREATE TABLE reported_incidents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    details TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin account (Password should be hashed in a real app)
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', 'admin', 'admin');