-- MySQL Database Schema for Lost & Found Portal (XAMPP Compatible)

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prn VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    role ENUM('SUPER_ADMIN', 'LF_OFFICER', 'STAFF', 'STUDENT') DEFAULT 'STUDENT',
    status ENUM('PENDING', 'VERIFIED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED', 'DELETED', 'GRADUATED') DEFAULT 'PENDING',
    
    department VARCHAR(50),
    branch VARCHAR(50),
    study_year VARCHAR(10),
    division VARCHAR(10),
    roll_number VARCHAR(20),
    
    gender VARCHAR(10),
    dob DATE,
    blood_group VARCHAR(5),
    address TEXT,
    
    hosteller_day_scholar VARCHAR(20),
    identity_card_number VARCHAR(50),
    admission_year INT,
    passing_year INT,
    
    photo_url TEXT,
    
    email_verified BOOLEAN DEFAULT FALSE,
    mobile_verified BOOLEAN DEFAULT FALSE,
    
    last_login DATETIME,
    login_count INT DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    browser VARCHAR(255),
    device VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert a default Super Admin
INSERT INTO users (prn, full_name, email, mobile_number, password_hash, role, status)
VALUES ('ADMIN001', 'System Administrator', 'admin@zealcollege.edu.in', '9999999999', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SUPER_ADMIN', 'ACTIVE');
-- Note: Password is 'password' (hashed with bcrypt)
