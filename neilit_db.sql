-- MySQL dump 10.13  Distrib 8.0.19, for macos10.15 (x86_64)
--
-- Host: localhost    Database: neilit_db
-- ------------------------------------------------------
-- Server version	8.0.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `backtest`
--

DROP TABLE IF EXISTS `backtest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backtest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pair_id` int DEFAULT NULL,
  `direction` enum('long','short') DEFAULT NULL,
  `result` enum('%','R') NOT NULL,
  `strategy_id` int DEFAULT NULL,
  `timeframe_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `pair_id` (`pair_id`),
  KEY `strategy_id` (`strategy_id`),
  KEY `timeframe_id` (`timeframe_id`),
  CONSTRAINT `backtest_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `backtest_ibfk_2` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`),
  CONSTRAINT `backtest_ibfk_3` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`),
  CONSTRAINT `backtest_ibfk_4` FOREIGN KEY (`timeframe_id`) REFERENCES `timeframes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backtest`
--

LOCK TABLES `backtest` WRITE;
/*!40000 ALTER TABLE `backtest` DISABLE KEYS */;
INSERT INTO `backtest` VALUES (1,1,'2020-10-13 16:04:46',1,NULL,'%',5,NULL);
/*!40000 ALTER TABLE `backtest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backtest_addons`
--

DROP TABLE IF EXISTS `backtest_addons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backtest_addons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `backtest_id` int NOT NULL,
  `description` varchar(1000) NOT NULL,
  `is_integers` tinyint(1) NOT NULL DEFAULT '0',
  `option1` varchar(1000) DEFAULT NULL,
  `option2` varchar(1000) DEFAULT NULL,
  `option3` varchar(1000) DEFAULT NULL,
  `option4` varchar(1000) DEFAULT NULL,
  `option5` varchar(1000) DEFAULT NULL,
  `option6` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `backtest_id` (`backtest_id`),
  CONSTRAINT `backtest_addons_ibfk_1` FOREIGN KEY (`backtest_id`) REFERENCES `backtest` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backtest_addons`
--

LOCK TABLES `backtest_addons` WRITE;
/*!40000 ALTER TABLE `backtest_addons` DISABLE KEYS */;
INSERT INTO `backtest_addons` VALUES (1,1,'Is RSI on overbought, oversold, or N/A?',0,'Overbought','Oversold','N/A',NULL,NULL,NULL),(2,1,'What is the ADX value on entry?',1,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `backtest_addons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backtest_addons_data`
--

DROP TABLE IF EXISTS `backtest_addons_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backtest_addons_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `backtest_id` int NOT NULL,
  `backtest_data_id` int NOT NULL,
  `backtest_addons_id` int NOT NULL,
  `addon_value` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `backtest_id` (`backtest_id`),
  KEY `backtest_addons_id` (`backtest_addons_id`),
  CONSTRAINT `backtest_addons_data_ibfk_1` FOREIGN KEY (`backtest_id`) REFERENCES `backtest` (`id`),
  CONSTRAINT `backtest_addons_data_ibfk_2` FOREIGN KEY (`backtest_addons_id`) REFERENCES `backtest_addons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backtest_addons_data`
--

LOCK TABLES `backtest_addons_data` WRITE;
/*!40000 ALTER TABLE `backtest_addons_data` DISABLE KEYS */;
INSERT INTO `backtest_addons_data` VALUES (1,1,1,1,1),(2,1,1,2,14.3),(3,1,2,1,3),(4,1,2,2,22.5),(5,1,3,1,2),(6,1,3,2,21.8),(7,1,4,1,2),(8,1,4,2,54.2),(9,1,5,1,1),(10,1,5,2,60.9);
/*!40000 ALTER TABLE `backtest_addons_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backtest_data`
--

DROP TABLE IF EXISTS `backtest_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backtest_data` (
  `identifier` int NOT NULL,
  `backtest_id` int NOT NULL,
  `direction` enum('long','short') DEFAULT NULL,
  `result` float NOT NULL,
  `pair_id` int DEFAULT NULL,
  `strategy_id` int DEFAULT NULL,
  `timeframe_id` int DEFAULT NULL,
  PRIMARY KEY (`identifier`),
  KEY `backtest_id` (`backtest_id`),
  KEY `pair_id` (`pair_id`),
  KEY `strategy_id` (`strategy_id`),
  KEY `timeframe_id` (`timeframe_id`),
  CONSTRAINT `backtest_data_ibfk_1` FOREIGN KEY (`backtest_id`) REFERENCES `backtest` (`id`),
  CONSTRAINT `backtest_data_ibfk_2` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`),
  CONSTRAINT `backtest_data_ibfk_3` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`),
  CONSTRAINT `backtest_data_ibfk_4` FOREIGN KEY (`timeframe_id`) REFERENCES `timeframes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backtest_data`
--

LOCK TABLES `backtest_data` WRITE;
/*!40000 ALTER TABLE `backtest_data` DISABLE KEYS */;
INSERT INTO `backtest_data` VALUES (1,1,'long',1,NULL,NULL,1),(2,1,'short',-1,NULL,NULL,1),(3,1,'short',-1,NULL,NULL,1),(4,1,'long',0.5,NULL,NULL,1),(5,1,'long',2.5,NULL,NULL,1);
/*!40000 ALTER TABLE `backtest_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checklists`
--

DROP TABLE IF EXISTS `checklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checklists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `checklist` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `checklists_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checklists`
--

LOCK TABLES `checklists` WRITE;
/*!40000 ALTER TABLE `checklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `checklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comment` varchar(4000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,'2020-10-13 16:04:46','This is the first comment ever inside NEILIT'),(2,1,'2020-10-13 16:04:46','I\'m a consistently successful trader!'),(3,1,'2020-10-13 16:04:46','What you just read is my trading mantra');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currencies`
--

DROP TABLE IF EXISTS `currencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currencies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency` varchar(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currencies`
--

LOCK TABLES `currencies` WRITE;
/*!40000 ALTER TABLE `currencies` DISABLE KEYS */;
INSERT INTO `currencies` VALUES (1,'USD'),(2,'EUR'),(3,'CAD'),(4,'JPY'),(5,'GBP'),(6,'CHF'),(7,'AUD');
/*!40000 ALTER TABLE `currencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entries`
--

DROP TABLE IF EXISTS `entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pair_id` int NOT NULL,
  `category` varchar(20) NOT NULL,
  `size` double NOT NULL,
  `strategy_id` int NOT NULL,
  `timeframe_id` int NOT NULL,
  `entry_dt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `exit_dt` timestamp NULL DEFAULT NULL,
  `direction` enum('long','short') NOT NULL,
  `entry_price` decimal(8,5) NOT NULL,
  `stop_loss` decimal(8,5) DEFAULT NULL,
  `take_profit` decimal(8,5) DEFAULT NULL,
  `exit_price` decimal(8,5) DEFAULT NULL,
  `profits` decimal(10,4) DEFAULT NULL,
  `fees` decimal(8,4) DEFAULT NULL,
  `ta_id` int DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `comment` varchar(4000) DEFAULT NULL,
  `result` enum('win','loss','be') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `pair_id` (`pair_id`),
  KEY `strategy_id` (`strategy_id`),
  KEY `ta_id` (`ta_id`),
  CONSTRAINT `entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `entries_ibfk_2` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`),
  CONSTRAINT `entries_ibfk_3` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`),
  CONSTRAINT `entries_ibfk_4` FOREIGN KEY (`ta_id`) REFERENCES `tanalysis` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entries`
--

LOCK TABLES `entries` WRITE;
/*!40000 ALTER TABLE `entries` DISABLE KEYS */;
INSERT INTO `entries` VALUES (1,1,121,'Forex',1,4,1,'2019-04-23 15:30:00','2019-04-22 22:00:00','long',107.19900,106.92000,107.96000,107.96000,76100.0000,10.0000,1,1,'Nailed this trade!','win'),(2,1,60,'Forex',0.1,1,1,'2019-04-27 07:45:00','2019-04-27 11:00:00','short',1.52485,1.52677,1.51566,1.52485,100.0000,1.0000,2,1,'Retrace to the triangle neck. Give more room to the SL (not so tight).','loss'),(3,1,50,'Forex',10.01,5,1,'2019-04-27 16:08:56',NULL,'long',1.67585,1.69423,1.72414,NULL,NULL,NULL,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `goal` varchar(100) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goals`
--

LOCK TABLES `goals` WRITE;
/*!40000 ALTER TABLE `goals` DISABLE KEYS */;
INSERT INTO `goals` VALUES (1,'Finish Neilit',1);
/*!40000 ALTER TABLE `goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `languages` (
  `language` varchar(2) NOT NULL,
  PRIMARY KEY (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES ('ca'),('en'),('es');
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `objectives`
--

DROP TABLE IF EXISTS `objectives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `objectives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `type` enum('fin','nonfin') DEFAULT NULL,
  `objective` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `objectives_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `objectives`
--

LOCK TABLES `objectives` WRITE;
/*!40000 ALTER TABLE `objectives` DISABLE KEYS */;
/*!40000 ALTER TABLE `objectives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pairs`
--

DROP TABLE IF EXISTS `pairs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pairs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pair` varchar(11) NOT NULL,
  `category` varchar(14) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pairs`
--

LOCK TABLES `pairs` WRITE;
/*!40000 ALTER TABLE `pairs` DISABLE KEYS */;
INSERT INTO `pairs` VALUES (1,'AUD/CAD','Forex'),(2,'AUD/CHF','Forex'),(3,'AUD/CZK','Forex'),(4,'AUD/DKK','Forex'),(5,'AUD/HKD','Forex'),(6,'AUD/HUF','Forex'),(7,'AUD/JPY','Forex'),(8,'AUD/MXN','Forex'),(9,'AUD/NOK','Forex'),(10,'AUD/NZD','Forex'),(11,'AUD/PLN','Forex'),(12,'AUD/SEK','Forex'),(13,'AUD/SGD','Forex'),(14,'AUD/USD','Forex'),(15,'AUD/ZAR','Forex'),(16,'CAD/CHF','Forex'),(17,'CAD/CZK','Forex'),(18,'CAD/DKK','Forex'),(19,'CAD/HKD','Forex'),(20,'CAD/HUF','Forex'),(21,'CAD/JPY','Forex'),(22,'CAD/MXN','Forex'),(23,'CAD/NOK','Forex'),(24,'CAD/PLN','Forex'),(25,'CAD/SEK','Forex'),(26,'CAD/SGD','Forex'),(27,'CAD/ZAR','Forex'),(28,'CHF/CZK','Forex'),(29,'CHF/DKK','Forex'),(30,'CHF/HKD','Forex'),(31,'CHF/HUF','Forex'),(32,'CHF/JPY','Forex'),(33,'CHF/MXN','Forex'),(34,'CHF/NOK','Forex'),(35,'CHF/PLN','Forex'),(36,'CHF/SEK','Forex'),(37,'CHF/SGD','Forex'),(38,'CHF/TRY','Forex'),(39,'CHF/ZAR','Forex'),(40,'DKK/CZK','Forex'),(41,'DKK/HKD','Forex'),(42,'DKK/HUF','Forex'),(43,'DKK/MXN','Forex'),(44,'DKK/NOK','Forex'),(45,'DKK/PLN','Forex'),(46,'DKK/SEK','Forex'),(47,'DKK/SGD','Forex'),(48,'DKK/ZAR','Forex'),(49,'EUR/AUD','Forex'),(50,'EUR/CAD','Forex'),(51,'EUR/CHF','Forex'),(52,'EUR/CZK','Forex'),(53,'EUR/DKK','Forex'),(54,'EUR/GBP','Forex'),(55,'EUR/HKD','Forex'),(56,'EUR/HUF','Forex'),(57,'EUR/JPY','Forex'),(58,'EUR/MXN','Forex'),(59,'EUR/NOK','Forex'),(60,'EUR/NZD','Forex'),(61,'EUR/PLN','Forex'),(62,'EUR/SEK','Forex'),(63,'EUR/SGD','Forex'),(64,'EUR/TRY','Forex'),(65,'EUR/USD','Forex'),(66,'EUR/ZAR','Forex'),(67,'GBP/AUD','Forex'),(68,'GBP/CAD','Forex'),(69,'GBP/CHF','Forex'),(70,'GBP/CZK','Forex'),(71,'GBP/DKK','Forex'),(72,'GBP/HKD','Forex'),(73,'GBP/HUF','Forex'),(74,'GBP/JPY','Forex'),(75,'GBP/MXN','Forex'),(76,'GBP/NOK','Forex'),(77,'GBP/NZD','Forex'),(78,'GBP/PLN','Forex'),(79,'GBP/SEK','Forex'),(80,'GBP/SGD','Forex'),(81,'GBP/USD','Forex'),(82,'GBP/ZAR','Forex'),(83,'JPY/CZK','Forex'),(84,'JPY/DKK','Forex'),(85,'JPY/HKD','Forex'),(86,'JPY/HUF','Forex'),(87,'JPY/MXN','Forex'),(88,'JPY/NOK','Forex'),(89,'JPY/PLN','Forex'),(90,'JPY/SEK','Forex'),(91,'JPY/SGD','Forex'),(92,'JPY/ZAR','Forex'),(93,'NOK/CZK','Forex'),(94,'NOK/HKD','Forex'),(95,'NOK/HUF','Forex'),(96,'NOK/MXN','Forex'),(97,'NOK/PLN','Forex'),(98,'NOK/SEK','Forex'),(99,'NOK/SGD','Forex'),(100,'NOK/ZAR','Forex'),(101,'NZD/CAD','Forex'),(102,'NZD/CHF','Forex'),(103,'NZD/CZK','Forex'),(104,'NZD/DKK','Forex'),(105,'NZD/HKD','Forex'),(106,'NZD/HUF','Forex'),(107,'NZD/JPY','Forex'),(108,'NZD/MXN','Forex'),(109,'NZD/NOK','Forex'),(110,'NZD/PLN','Forex'),(111,'NZD/SEK','Forex'),(112,'NZD/SGD','Forex'),(113,'NZD/USD','Forex'),(114,'NZD/ZAR','Forex'),(115,'USD/CAD','Forex'),(116,'USD/CHF','Forex'),(117,'USD/CZK','Forex'),(118,'USD/DKK','Forex'),(119,'USD/HKD','Forex'),(120,'USD/HUF','Forex'),(121,'USD/JPY','Forex'),(122,'USD/MXN','Forex'),(123,'USD/NOK','Forex'),(124,'USD/PLN','Forex'),(125,'USD/SEK','Forex'),(126,'USD/SGD','Forex'),(127,'USD/TRY','Forex'),(128,'USD/ZAR','Forex');
/*!40000 ALTER TABLE `pairs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `broker` varchar(100) DEFAULT NULL,
  `charts` varchar(100) DEFAULT NULL,
  `capital` varchar(100) DEFAULT NULL,
  `routine` varchar(1000) DEFAULT NULL,
  `psy_notes` varchar(1000) DEFAULT NULL,
  `psy_tips` tinyint(1) NOT NULL DEFAULT '0',
  `jrn_process` varchar(1000) DEFAULT NULL,
  `str_revision` varchar(1000) DEFAULT NULL,
  `jrn_revision` varchar(1000) DEFAULT NULL,
  `pln_revision` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pln_positions`
--

DROP TABLE IF EXISTS `pln_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pln_positions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `strategy_id` int NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `rule_type` enum('tp-f','tp-p','sl-f','sl-p') DEFAULT NULL,
  `amount` decimal(5,2) DEFAULT NULL,
  `order_type` enum('market','limit') DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  KEY `strategy_id` (`strategy_id`),
  CONSTRAINT `pln_positions_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `pln_positions_ibfk_2` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pln_positions`
--

LOCK TABLES `pln_positions` WRITE;
/*!40000 ALTER TABLE `pln_positions` DISABLE KEYS */;
/*!40000 ALTER TABLE `pln_positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pln_strategies`
--

DROP TABLE IF EXISTS `pln_strategies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pln_strategies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `strategy_id` int NOT NULL,
  `about` varchar(1000) DEFAULT NULL,
  `howto` varchar(1000) DEFAULT NULL,
  `keynotes` varchar(1000) DEFAULT NULL,
  `timeframe_id` int DEFAULT NULL,
  `pair_id` int DEFAULT NULL,
  `risk` decimal(4,2) DEFAULT NULL,
  `backtest_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  KEY `strategy_id` (`strategy_id`),
  KEY `timeframe_id` (`timeframe_id`),
  KEY `pair_id` (`pair_id`),
  KEY `backtest_id` (`backtest_id`),
  CONSTRAINT `pln_strategies_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `pln_strategies_ibfk_2` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`),
  CONSTRAINT `pln_strategies_ibfk_3` FOREIGN KEY (`timeframe_id`) REFERENCES `timeframes` (`id`),
  CONSTRAINT `pln_strategies_ibfk_4` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`),
  CONSTRAINT `pln_strategies_ibfk_5` FOREIGN KEY (`backtest_id`) REFERENCES `backtest` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pln_strategies`
--

LOCK TABLES `pln_strategies` WRITE;
/*!40000 ALTER TABLE `pln_strategies` DISABLE KEYS */;
/*!40000 ALTER TABLE `pln_strategies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(40) NOT NULL,
  `price_id` varchar(4000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'free',NULL),(2,'legacy','price_1HTUBMFaIcvTY5RCKZixDYVk'),(3,'admin','neilit-secret');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `strategies`
--

DROP TABLE IF EXISTS `strategies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `strategies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `strategy` varchar(50) DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `strategies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `strategies`
--

LOCK TABLES `strategies` WRITE;
/*!40000 ALTER TABLE `strategies` DISABLE KEYS */;
INSERT INTO `strategies` VALUES (1,'Head & Shoulders',1),(2,'Double Bottom',1),(3,'Ascending Triangle',1),(4,'Cup & Handle',1),(5,'Dinosaur Pattern',1);
/*!40000 ALTER TABLE `strategies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stripe_users`
--

DROP TABLE IF EXISTS `stripe_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stripe_users` (
  `user_id` int NOT NULL,
  `stripeCustomerPaymentMethodId` varchar(500) NOT NULL,
  `expiration` date DEFAULT NULL,
  `last4` varchar(4) DEFAULT NULL,
  `figerprint` varchar(500) DEFAULT NULL,
  `billingDetails` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`stripeCustomerPaymentMethodId`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stripe_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stripe_users`
--

LOCK TABLES `stripe_users` WRITE;
/*!40000 ALTER TABLE `stripe_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `stripe_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tanalysis`
--

DROP TABLE IF EXISTS `tanalysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tanalysis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(20) NOT NULL,
  `pair_id` int NOT NULL,
  `created_at` date NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pair_id` (`pair_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tanalysis_ibfk_1` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`),
  CONSTRAINT `tanalysis_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tanalysis`
--

LOCK TABLES `tanalysis` WRITE;
/*!40000 ALTER TABLE `tanalysis` DISABLE KEYS */;
INSERT INTO `tanalysis` VALUES (1,'Forex',1,'2020-03-23',1),(2,'Forex',2,'2020-03-23',1);
/*!40000 ALTER TABLE `tanalysis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telementanalysis`
--

DROP TABLE IF EXISTS `telementanalysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `telementanalysis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ta_id` int NOT NULL,
  `order_at` int NOT NULL,
  `element_id` int NOT NULL,
  `content` varchar(4000) DEFAULT NULL,
  `file` blob,
  `strategy_id` int DEFAULT NULL,
  `timeframe_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ta_id` (`ta_id`),
  KEY `element_id` (`element_id`),
  KEY `strategy_id` (`strategy_id`),
  KEY `timeframe_id` (`timeframe_id`),
  CONSTRAINT `telementanalysis_ibfk_1` FOREIGN KEY (`ta_id`) REFERENCES `tanalysis` (`id`),
  CONSTRAINT `telementanalysis_ibfk_2` FOREIGN KEY (`element_id`) REFERENCES `telements` (`id`),
  CONSTRAINT `telementanalysis_ibfk_3` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`),
  CONSTRAINT `telementanalysis_ibfk_4` FOREIGN KEY (`timeframe_id`) REFERENCES `timeframes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telementanalysis`
--

LOCK TABLES `telementanalysis` WRITE;
/*!40000 ALTER TABLE `telementanalysis` DISABLE KEYS */;
INSERT INTO `telementanalysis` VALUES (1,1,1,1,'More on weekly forecasting and trading',NULL,NULL,NULL),(2,1,2,1,'Forecasting',NULL,NULL,NULL),(3,1,3,1,'',NULL,NULL,NULL),(4,1,4,3,'LINK/EUR, ascending channel on the 4-hour charts (the daily doesn\'t look that good). There is a potential bounce from the bottom of the trend-line and 21EMA. I am also actively looking for a cup &amp\n    ; handle pattern. The SL is quite big on 9%.<span style=\"font-size: 1rem;\">&nbsp;</span>',NULL,NULL,NULL),(5,1,5,4,NULL,NULL,4,9),(6,1,6,4,NULL,NULL,2,9),(7,2,1,3,'Utilice este espacio para escribir algún comentario adicional',NULL,NULL,NULL),(8,2,2,1,'Wednesday, 18 March 2020',NULL,NULL,NULL),(9,2,3,1,'Forecasting (1st of day)',NULL,NULL,NULL),(10,2,4,3,'The LTC failed to break the 21EMA towards the upside. The price managed to close one candle above the 21EMA in the 4-hour charts, but went back down. I am looking for a possible re-test of the bottom support for the following days.',NULL,NULL,NULL),(11,2,5,4,NULL,NULL,2,9);
/*!40000 ALTER TABLE `telementanalysis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telements`
--

DROP TABLE IF EXISTS `telements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `telements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telements`
--

LOCK TABLES `telements` WRITE;
/*!40000 ALTER TABLE `telements` DISABLE KEYS */;
INSERT INTO `telements` VALUES (1,'title'),(2,'image'),(3,'text'),(4,'strategy');
/*!40000 ALTER TABLE `telements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timeframes`
--

DROP TABLE IF EXISTS `timeframes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timeframes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timeframe` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timeframes`
--

LOCK TABLES `timeframes` WRITE;
/*!40000 ALTER TABLE `timeframes` DISABLE KEYS */;
INSERT INTO `timeframes` VALUES (1,'1 minute'),(2,'3 minutes'),(3,'5 minutes'),(4,'15 minutes'),(5,'30 minutes'),(6,'45 minute'),(7,'1 hour'),(8,'2 hours'),(9,'3 hours'),(10,'4 hours'),(11,'12 hours'),(12,'1 day'),(13,'1 week'),(14,'1 month');
/*!40000 ALTER TABLE `timeframes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(40) NOT NULL,
  `email` varchar(40) NOT NULL,
  `name` varchar(40) NOT NULL,
  `surname` varchar(40) NOT NULL,
  `language` varchar(2) NOT NULL DEFAULT 'en',
  `role_id` int NOT NULL,
  `password` varchar(4000) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `currency_id` int NOT NULL,
  `balance` decimal(10,4) NOT NULL,
  `showProfits` tinyint(1) NOT NULL DEFAULT '0',
  `darkMode` tinyint(1) NOT NULL DEFAULT '0',
  `resetPasswordToken` varchar(4000) DEFAULT NULL,
  `resetPasswordExpire` datetime DEFAULT NULL,
  `stripeCustomerId` varchar(500) DEFAULT NULL,
  `stripeSubscriptionId` varchar(500) DEFAULT NULL,
  `stripeProductId` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `language` (`language`),
  KEY `role_id` (`role_id`),
  KEY `currency_id` (`currency_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`language`) REFERENCES `languages` (`language`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'shyvama','oriolripaltaimaso@gmail.com','Oriol','Ripalta Maso','en',3,'$2b$10$.4zYMyUWYKogR.zubtywO.xXh5QpCnSozdlNM6epLlZe7xcCFgRoq','2020-10-13 16:04:46',2,10000.0000,0,0,NULL,NULL,NULL,NULL,NULL),(2,'mmmitusss','gelabertgalmes98@gmail.com','Jaume','Gelabert Galmes','en',3,'$2b$10$3zqVeJt9UlMAK6zonCrEcexMPqw0GXatlxH059gbvFQB5DJAGI5uW','2020-10-13 16:04:46',2,0.0000,0,0,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-10-13 18:05:02
