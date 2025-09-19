SELECT * FROM flame_shield2.sensor_data;

CREATE DATABASE flame_shield;
USE flame_shield2;
-- First, create tables in the correct order
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_no` varchar(15) DEFAULT NULL,
  `address` text,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `machines` (
  `machine_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `machine_name` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `location` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`machine_id`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `machines_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `cylinders` (
  `cylinder_id` int NOT NULL AUTO_INCREMENT,
  `machine_id` int NOT NULL,
  `gas_weight` decimal(5,2) DEFAULT NULL,
  `replaced_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cylinder_id`),
  KEY `machine_id` (`machine_id`),
  CONSTRAINT `cylinders_ibfk_1` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`machine_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `sensor_data` (
  `sensor_id` int NOT NULL AUTO_INCREMENT,
  `machine_id` int NOT NULL,
  `current_weight` decimal(5,2) NOT NULL,
  `gas_content_weight` decimal(5,2) NOT NULL,
  `gas_leak_detected` tinyint(1) DEFAULT '0',
  `tare_weight` decimal(5,2) NOT NULL,
  `timestamp` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sensor_id`),
  KEY `machine_id` (`machine_id`),
  CONSTRAINT `sensor_data_ibfk_1` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`machine_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Now insert data
INSERT INTO `users` (`user_id`, `name`, `email`, `phone_no`, `address`, `password`, `created_at`) VALUES
(1, 'John Doe', 'john@example.com', '1234567890', '123 Main St', 'hashed_password', '2025-08-13 10:00:00');

INSERT INTO `machines` (`machine_id`, `user_id`, `machine_name`, `serial_number`, `location`, `created_at`) VALUES
(2, 1, 'Gas Machine A', 'SN123', 'Kitchen', '2025-08-13 10:05:00'),
(3, 1, 'Gas Machine B', 'SN456', 'Backyard', '2025-08-13 10:06:00'),
(123, 1, 'Gas Machine C', 'SN789', 'Restaurant', '2025-08-13 10:07:00');

INSERT INTO `cylinders` (`cylinder_id`, `machine_id`, `gas_weight`, `replaced_date`, `created_at`) VALUES
(1, 2, 14.50, '2025-08-10', '2025-08-13 10:15:00'),
(2, 3, 15.00, '2025-08-11', '2025-08-13 10:16:00'),
(3, 123, 18.00, '2025-08-12', '2025-08-13 10:17:00');

INSERT INTO `sensor_data` (`sensor_id`, `machine_id`, `current_weight`, `gas_content_weight`, `gas_leak_detected`, `tare_weight`, `timestamp`, `created_at`) VALUES
(4, 2, 6.90, 14.70, 0, 29.70, 1755066600, '2025-08-13 10:24:52'),
(5, 2, 5.80, 13.20, 0, 29.70, 1755073800, '2025-08-13 10:24:52'),
(6, 2, 4.50, 10.50, 1, 29.70, 1755081000, '2025-08-13 10:24:52'),
(7, 3, 7.50, 15.00, 0, 30.00, 1755068400, '2025-08-13 10:24:52'),
(8, 3, 6.20, 13.50, 0, 30.00, 1755077400, '2025-08-13 10:24:52'),
(9, 3, 4.90, 11.00, 1, 30.00, 1755086400, '2025-08-13 10:24:52'),
(13, 3, 8.20, 16.50, 0, 30.00, 1755055800, '2025-08-13 11:16:42'),
(14, 3, 7.10, 14.90, 0, 30.00, 1755066600, '2025-08-13 11:16:42'),
(15, 3, 5.60, 12.30, 1, 30.00, 1755077400, '2025-08-13 11:16:42'),
(16, 123, 9.00, 18.00, 0, 32.00, 1755061200, '2025-08-13 11:16:42'),
(17, 123, 7.80, 15.40, 0, 32.00, 1755072000, '2025-08-13 11:16:42'),
(18, 123, 6.10, 12.70, 1, 32.00, 1755082800, '2025-08-13 11:16:42');