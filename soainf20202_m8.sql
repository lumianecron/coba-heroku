-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.1.38-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for soainf20202_m8
CREATE DATABASE IF NOT EXISTS `soainf20202_m8` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `soainf20202_m8`;

-- Dumping structure for table soainf20202_m8.access_log
CREATE TABLE IF NOT EXISTS `access_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `apikey` varchar(32) NOT NULL,
  `path` varchar(255) NOT NULL,
  `full_url` varchar(255) NOT NULL,
  `accessed_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table soainf20202_m8.access_log: ~0 rows (approximately)
/*!40000 ALTER TABLE `access_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `access_log` ENABLE KEYS */;

-- Dumping structure for table soainf20202_m8.apikey
CREATE TABLE IF NOT EXISTS `apikey` (
  `apikey` varchar(32) NOT NULL,
  `plan` tinyint(4) NOT NULL DEFAULT '0',
  `last_paid` datetime DEFAULT NULL,
  PRIMARY KEY (`apikey`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table soainf20202_m8.apikey: ~4 rows (approximately)
/*!40000 ALTER TABLE `apikey` DISABLE KEYS */;
INSERT INTO `apikey` (`apikey`, `plan`, `last_paid`) VALUES
	('1234', 0, NULL),
	('asdf', 2, NULL),
	('qwer', 1, NULL),
	('zxcv', 3, NULL);
/*!40000 ALTER TABLE `apikey` ENABLE KEYS */;

-- Dumping structure for table soainf20202_m8.plan
CREATE TABLE IF NOT EXISTS `plan` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table soainf20202_m8.plan: ~4 rows (approximately)
/*!40000 ALTER TABLE `plan` DISABLE KEYS */;
INSERT INTO `plan` (`id`, `name`) VALUES
	(0, 'free'),
	(1, 'pay per use'),
	(2, 'quota'),
	(3, 'hybrid');
/*!40000 ALTER TABLE `plan` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
