CREATE DATABASE IF NOT EXISTS flame_shield;

USE flame_shield;
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone_no VARCHAR(15),
  address TEXT,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE machines (
  machine_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  machine_name VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE cylinders (
  cylinder_id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id INT NOT NULL,
  gas_weight DECIMAL(5,2),
  replaced_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);

CREATE TABLE sensor_data (
  sensor_id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id INT NOT NULL,
  current_weight DECIMAL(5,2) NOT NULL,
  gas_content_weight DECIMAL(5,2) NOT NULL,
  gas_leak_detected BOOLEAN DEFAULT FALSE,
  tare_weight DECIMAL(5,2) NOT NULL,
  timestamp INT NOT NULL, -- Store UNIX timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);
