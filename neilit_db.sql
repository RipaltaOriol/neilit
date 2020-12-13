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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backtest`
--

LOCK TABLES `backtest` WRITE;
/*!40000 ALTER TABLE `backtest` DISABLE KEYS */;
INSERT INTO `backtest` VALUES (2,1,'2020-10-22 07:43:55',NULL,NULL,'R',NULL,NULL),(3,1,'2020-12-01 16:22:58',2,'long','%',1,4),(4,1,'2020-12-01 16:22:58',2,'long','%',1,4),(5,1,'2020-12-01 16:22:58',2,'long','%',1,4),(6,1,'2020-12-01 16:22:58',2,'long','%',1,4),(7,1,'2020-12-01 16:22:58',2,'long','%',1,4),(8,1,'2020-12-01 16:22:58',2,'long','%',1,4),(9,1,'2020-12-01 16:22:58',2,'long','%',1,4),(10,1,'2020-12-01 16:22:58',2,'long','%',1,4),(11,1,'2020-12-01 16:22:58',2,'long','%',1,4),(12,1,'2020-12-01 16:22:58',2,'long','%',1,4),(13,1,'2020-12-01 16:22:58',2,'long','%',1,4),(15,1,'2020-12-01 16:22:58',2,'long','%',1,4),(16,1,'2020-12-02 21:25:38',4,NULL,'R',NULL,NULL),(17,1,'2020-12-02 21:26:07',NULL,NULL,'R',NULL,NULL),(18,1,'2020-12-05 10:33:03',1,'short','R',1,3),(19,1,'2020-12-05 10:33:03',1,'short','R',1,3),(20,1,'2020-12-05 10:33:03',1,'short','R',1,3),(21,1,'2020-12-05 10:33:03',1,'short','R',1,3),(22,1,'2020-12-05 10:33:03',1,'short','R',1,3),(23,1,'2020-12-05 10:33:03',1,'short','R',1,3),(24,1,'2020-12-05 10:33:03',1,'short','R',1,3),(25,1,'2020-12-05 10:33:03',1,'short','R',1,3),(26,1,'2020-12-05 10:33:03',1,'short','R',1,3),(27,1,'2020-12-05 10:33:03',1,'short','R',1,3),(28,1,'2020-12-05 10:33:03',1,'short','R',1,3),(29,1,'2020-12-05 10:33:03',1,'short','R',1,3),(30,1,'2020-12-05 10:33:03',1,'short','R',1,3),(31,1,'2020-12-05 10:33:03',1,'short','R',1,3),(32,1,'2020-12-05 10:33:03',1,'short','R',1,3),(33,1,'2020-12-05 10:33:03',1,'short','R',1,3),(34,1,'2020-12-05 10:33:03',1,'short','R',1,3),(35,1,'2020-12-05 10:33:03',1,'short','R',1,3),(36,1,'2020-12-05 10:33:03',1,'short','R',1,3),(37,1,'2020-12-05 10:33:03',1,'short','R',1,3),(38,1,'2020-12-05 10:33:03',1,'short','R',1,3);
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backtest_addons`
--

LOCK TABLES `backtest_addons` WRITE;
/*!40000 ALTER TABLE `backtest_addons` DISABLE KEYS */;
INSERT INTO `backtest_addons` VALUES (3,2,'Maxing out components',1,NULL,NULL,NULL,NULL,NULL,NULL),(4,2,'Maxing out components',1,NULL,NULL,NULL,NULL,NULL,NULL),(5,2,'Maxing out components',1,NULL,NULL,NULL,NULL,NULL,NULL),(6,2,'Maxing out components',1,NULL,NULL,NULL,NULL,NULL,NULL),(7,2,'Maxing out components',1,NULL,NULL,NULL,NULL,NULL,NULL),(8,2,'Maxing out components',1,NULL,NULL,NULL,NULL,NULL,NULL),(9,16,'Some name',1,NULL,NULL,NULL,NULL,NULL,NULL),(10,17,'True Vibration Rules',0,'Yes','No',NULL,NULL,NULL,NULL);
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
  CONSTRAINT `backtest_addons_data_ibfk_1` FOREIGN KEY (`backtest_id`) REFERENCES `backtest` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backtest_addons_data`
--

LOCK TABLES `backtest_addons_data` WRITE;
/*!40000 ALTER TABLE `backtest_addons_data` DISABLE KEYS */;
INSERT INTO `backtest_addons_data` VALUES (157,2,61,1,1),(158,2,61,2,NULL),(159,2,61,3,NULL),(160,2,61,4,NULL),(161,2,61,5,NULL),(162,2,61,6,NULL),(163,2,62,1,1),(164,2,62,2,NULL),(165,2,62,3,NULL),(166,2,62,4,NULL),(167,2,62,5,NULL),(168,2,62,6,NULL),(169,2,63,1,1),(170,2,63,2,NULL),(171,2,63,3,NULL),(172,2,63,4,NULL),(173,2,63,5,NULL),(174,2,63,6,NULL),(175,2,64,1,1),(176,2,64,2,NULL),(177,2,64,3,NULL),(178,2,64,4,NULL),(179,2,64,5,NULL),(180,2,64,6,NULL);
/*!40000 ALTER TABLE `backtest_addons_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backtest_data`
--

DROP TABLE IF EXISTS `backtest_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backtest_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identifier` int NOT NULL,
  `backtest_id` int NOT NULL,
  `direction` enum('long','short') DEFAULT NULL,
  `result` float NOT NULL,
  `pair_id` int DEFAULT NULL,
  `strategy_id` int DEFAULT NULL,
  `timeframe_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `backtest_id` (`backtest_id`),
  KEY `pair_id` (`pair_id`),
  KEY `strategy_id` (`strategy_id`),
  KEY `timeframe_id` (`timeframe_id`),
  CONSTRAINT `backtest_data_ibfk_1` FOREIGN KEY (`backtest_id`) REFERENCES `backtest` (`id`),
  CONSTRAINT `backtest_data_ibfk_2` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`),
  CONSTRAINT `backtest_data_ibfk_3` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`),
  CONSTRAINT `backtest_data_ibfk_4` FOREIGN KEY (`timeframe_id`) REFERENCES `timeframes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backtest_data`
--

LOCK TABLES `backtest_data` WRITE;
/*!40000 ALTER TABLE `backtest_data` DISABLE KEYS */;
INSERT INTO `backtest_data` VALUES (61,1,2,'long',1,1,1,1),(62,2,2,'long',1,1,1,1),(63,3,2,'long',1,1,1,1),(64,4,2,'long',1,1,1,1),(65,1,29,'short',1,1,1,3),(66,2,29,'short',1,1,1,3),(67,3,29,'short',1,1,1,3),(68,4,29,'short',1,1,1,3),(69,5,29,'short',1,1,1,3),(70,6,29,'short',1,1,1,3),(71,7,29,'short',1,1,1,3),(72,8,29,'short',1,1,1,3),(73,9,29,'short',1,1,1,3),(74,10,29,'short',1,1,1,3),(75,11,29,'short',1,1,1,3),(76,12,29,'short',1,1,1,3),(77,13,29,'short',1,1,1,3),(78,14,29,'short',1,1,1,3),(79,15,29,'short',1,1,1,3),(80,16,29,'short',1,1,1,3),(81,17,29,'short',1,1,1,3),(82,18,29,'short',1,1,1,3),(83,19,29,'short',1,1,1,3),(84,20,29,'short',1,1,1,3),(85,21,29,'short',1,1,1,3),(86,22,29,'short',1,1,1,3),(87,23,29,'short',1,1,1,3),(88,24,29,'short',1,1,1,3),(89,25,29,'short',1,1,1,3),(90,26,29,'short',1,1,1,3),(91,27,29,'short',1,1,1,3),(92,28,29,'short',1,1,1,3),(93,29,29,'short',1,1,1,3),(94,30,29,'short',1,1,1,3),(95,31,29,'short',1,1,1,3),(96,32,29,'short',1,1,1,3),(97,33,29,'short',1,1,1,3),(98,34,29,'short',1,1,1,3),(99,35,29,'short',1,1,1,3),(100,36,29,'short',1,1,1,3),(101,37,29,'short',1,1,1,3),(102,38,29,'short',1,1,1,3),(103,39,29,'short',1,1,1,3),(104,40,29,'short',1,1,1,3),(105,41,29,'short',1,1,1,3);
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
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,'2020-11-30 09:25:05','This is the first comment ever inside NEILIT','2020-11-30 09:25:04'),(2,1,'2020-11-28 18:47:17','Does it keep spacing?<br><br><br>Don\'t think so','2020-11-30 09:23:50'),(3,1,'2020-11-28 18:48:55','What you just read is my trading mantra. Bacon ipsum dolor amet tenderloin drumstick shankle buffalo porchetta corned beef leberkas prosciutto ground round brisket salami pork loin. Swine tri-tip short loin chicken buffalo. Chicken tenderloin kevin, landjaeger chislic flank andouille doner burgdoggen. Pork belly chuck pastrami short ribs leberkas tenderloin, pork loin jowl ball tip landjaeger shoulder chicken andouille. Salami buffalo biltong chuck, leberkas beef ribs porchetta turkey jerky venison tri-tip.','2020-11-30 09:23:50'),(4,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(5,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(6,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(7,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(8,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(9,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(10,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(11,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(12,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(13,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(14,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(15,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(16,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(17,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(18,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(19,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(20,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(21,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(22,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(23,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(24,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(25,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(26,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(27,1,'2020-11-30 09:24:43','Auto-generated','2020-11-30 09:24:42'),(28,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(29,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(30,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50'),(31,1,'2020-12-29 23:00:00','Auto-generated','2020-11-30 09:23:50');
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
  KEY `pair_id` (`pair_id`),
  KEY `strategy_id` (`strategy_id`),
  KEY `ta_id` (`ta_id`),
  KEY `idx_user_entry_status` (`user_id`,`status`),
  KEY `idx_user_entry` (`user_id`),
  CONSTRAINT `entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `entries_ibfk_2` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`),
  CONSTRAINT `entries_ibfk_3` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`),
  CONSTRAINT `entries_ibfk_4` FOREIGN KEY (`ta_id`) REFERENCES `tanalysis` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entries`
--

LOCK TABLES `entries` WRITE;
/*!40000 ALTER TABLE `entries` DISABLE KEYS */;
INSERT INTO `entries` VALUES (1,1,121,'Forex',1,1,1,'2019-04-24 15:30:00','2019-04-22 22:00:00','long',107.19900,106.92000,107.96000,107.96000,76100.0000,10.0000,1,1,'Nailed this trade!','win'),(2,1,60,'Forex',0.1,1,1,'2019-04-27 07:45:00','2019-04-27 11:00:00','short',1.52485,1.52677,1.51566,1.52485,100.0000,1.0000,2,1,'Retrace to the triangle neck. Give more room to the SL (not so tight).','loss'),(3,1,1,'Forex',10.01,1,1,'2019-04-27 16:08:00','2020-10-17 22:00:00','long',1.67585,1.69423,1.72414,1.67585,0.0000,13.0000,1,1,NULL,'be'),(5,1,1,'Forex',0.01,1,1,'2020-10-11 22:00:00','2020-10-18 22:00:00','long',1.22222,NULL,NULL,1.22233,150.0000,33.0000,NULL,1,NULL,'win'),(6,1,2,'Forex',1,1,1,'2020-10-21 09:51:03',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(77,1,1,'Forex',0.5,1,1,'2020-11-03 23:00:00','2020-11-19 23:00:00','long',1.12120,NULL,NULL,1.12000,-55.5710,0.0000,NULL,1,NULL,'win'),(78,1,5,'Forex',0.75,1,2,'2020-11-03 23:00:00',NULL,'short',1.12120,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(79,1,88,'Forex',0.75,3,5,'2020-11-03 23:00:00',NULL,'short',1.13000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(80,1,88,'Forex',2,3,6,'2020-11-03 23:00:00',NULL,'long',1.13000,1.00000,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(81,1,1,'Forex',2,3,6,'2020-11-03 23:00:00',NULL,'long',1.13000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(82,1,100,'Forex',2,3,6,'2020-09-03 22:00:00',NULL,'short',1.13000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(83,1,1,'Forex',2,1,1,'2020-11-08 11:41:00','2020-11-07 23:00:00','short',1.13000,1.00000,NULL,1.10000,150.0000,10.0000,NULL,1,NULL,'loss'),(84,1,1,'Forex',2,1,1,'2020-11-08 11:41:00','2020-11-07 23:00:00','long',1.13000,NULL,NULL,1.50000,-67.0000,8.1200,NULL,1,'Some nice comment.','win'),(85,1,1,'Forex',1,1,1,'2020-11-19 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,'Some silly comment. No, this is not silly, what about the breaks.',NULL),(86,1,1,'Forex',1,1,1,'2020-11-19 23:00:00',NULL,'short',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,'Hello,<br>I\'m Mr. World.',NULL),(88,1,1,'Forex',0.001,1,1,'2020-11-24 23:00:00',NULL,'short',1.00010,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(89,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(90,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(91,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(92,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(93,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(94,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(95,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(96,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(97,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(98,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(99,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(100,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(101,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(102,1,1,'Forex',1,1,1,'2020-11-25 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(104,7,1,'Forex',0.001,45,1,'2020-11-26 23:00:00',NULL,'long',1.00000,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goals`
--

LOCK TABLES `goals` WRITE;
/*!40000 ALTER TABLE `goals` DISABLE KEYS */;
INSERT INTO `goals` VALUES (3,'Create a profitable strategy',1),(4,'Complete 20 backtests per week',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pairs`
--

LOCK TABLES `pairs` WRITE;
/*!40000 ALTER TABLE `pairs` DISABLE KEYS */;
INSERT INTO `pairs` VALUES (1,'AUD/CAD','Forex'),(2,'AUD/CHF','Forex'),(3,'AUD/CZK','Forex'),(4,'AUD/DKK','Forex'),(5,'AUD/HKD','Forex'),(6,'AUD/HUF','Forex'),(7,'AUD/JPY','Forex'),(8,'AUD/MXN','Forex'),(9,'AUD/NOK','Forex'),(10,'AUD/NZD','Forex'),(11,'AUD/PLN','Forex'),(12,'AUD/SEK','Forex'),(13,'AUD/SGD','Forex'),(14,'AUD/USD','Forex'),(15,'AUD/ZAR','Forex'),(16,'CAD/CHF','Forex'),(17,'CAD/CZK','Forex'),(18,'CAD/DKK','Forex'),(19,'CAD/HKD','Forex'),(20,'CAD/HUF','Forex'),(21,'CAD/JPY','Forex'),(22,'CAD/MXN','Forex'),(23,'CAD/NOK','Forex'),(24,'CAD/PLN','Forex'),(25,'CAD/SEK','Forex'),(26,'CAD/SGD','Forex'),(27,'CAD/ZAR','Forex'),(28,'CHF/CZK','Forex'),(29,'CHF/DKK','Forex'),(30,'CHF/HKD','Forex'),(31,'CHF/HUF','Forex'),(32,'CHF/JPY','Forex'),(33,'CHF/MXN','Forex'),(34,'CHF/NOK','Forex'),(35,'CHF/PLN','Forex'),(36,'CHF/SEK','Forex'),(37,'CHF/SGD','Forex'),(38,'CHF/TRY','Forex'),(39,'CHF/ZAR','Forex'),(40,'DKK/CZK','Forex'),(41,'DKK/HKD','Forex'),(42,'DKK/HUF','Forex'),(43,'DKK/MXN','Forex'),(44,'DKK/NOK','Forex'),(45,'DKK/PLN','Forex'),(46,'DKK/SEK','Forex'),(47,'DKK/SGD','Forex'),(48,'DKK/ZAR','Forex'),(49,'EUR/AUD','Forex'),(50,'EUR/CAD','Forex'),(51,'EUR/CHF','Forex'),(52,'EUR/CZK','Forex'),(53,'EUR/DKK','Forex'),(54,'EUR/GBP','Forex'),(55,'EUR/HKD','Forex'),(56,'EUR/HUF','Forex'),(57,'EUR/JPY','Forex'),(58,'EUR/MXN','Forex'),(59,'EUR/NOK','Forex'),(60,'EUR/NZD','Forex'),(61,'EUR/PLN','Forex'),(62,'EUR/SEK','Forex'),(63,'EUR/SGD','Forex'),(64,'EUR/TRY','Forex'),(65,'EUR/USD','Forex'),(66,'EUR/ZAR','Forex'),(67,'GBP/AUD','Forex'),(68,'GBP/CAD','Forex'),(69,'GBP/CHF','Forex'),(70,'GBP/CZK','Forex'),(71,'GBP/DKK','Forex'),(72,'GBP/HKD','Forex'),(73,'GBP/HUF','Forex'),(74,'GBP/JPY','Forex'),(75,'GBP/MXN','Forex'),(76,'GBP/NOK','Forex'),(77,'GBP/NZD','Forex'),(78,'GBP/PLN','Forex'),(79,'GBP/SEK','Forex'),(80,'GBP/SGD','Forex'),(81,'GBP/USD','Forex'),(82,'GBP/ZAR','Forex'),(83,'JPY/CZK','Forex'),(84,'JPY/DKK','Forex'),(85,'JPY/HKD','Forex'),(86,'JPY/HUF','Forex'),(87,'JPY/MXN','Forex'),(88,'JPY/NOK','Forex'),(89,'JPY/PLN','Forex'),(90,'JPY/SEK','Forex'),(91,'JPY/SGD','Forex'),(92,'JPY/ZAR','Forex'),(93,'NOK/CZK','Forex'),(94,'NOK/HKD','Forex'),(95,'NOK/HUF','Forex'),(96,'NOK/MXN','Forex'),(97,'NOK/PLN','Forex'),(98,'NOK/SEK','Forex'),(99,'NOK/SGD','Forex'),(100,'NOK/ZAR','Forex'),(101,'NZD/CAD','Forex'),(102,'NZD/CHF','Forex'),(103,'NZD/CZK','Forex'),(104,'NZD/DKK','Forex'),(105,'NZD/HKD','Forex'),(106,'NZD/HUF','Forex'),(107,'NZD/JPY','Forex'),(108,'NZD/MXN','Forex'),(109,'NZD/NOK','Forex'),(110,'NZD/PLN','Forex'),(111,'NZD/SEK','Forex'),(112,'NZD/SGD','Forex'),(113,'NZD/USD','Forex'),(114,'NZD/ZAR','Forex'),(115,'USD/CAD','Forex'),(116,'USD/CHF','Forex'),(117,'USD/CZK','Forex'),(118,'USD/DKK','Forex'),(119,'USD/HKD','Forex'),(120,'USD/HUF','Forex'),(121,'USD/JPY','Forex'),(122,'USD/MXN','Forex'),(123,'USD/NOK','Forex'),(124,'USD/PLN','Forex'),(125,'USD/SEK','Forex'),(126,'USD/SGD','Forex'),(127,'USD/TRY','Forex'),(128,'USD/ZAR','Forex'),(129,'REP/USD','Crypto'),(130,'BAT/USD','Crypto'),(131,'BTC/USD','Crypto'),(132,'BCH/USD','Crypto'),(133,'ADA/USD','Crypto'),(134,'LINK/USD','Crypto'),(135,'DASH/USD','Crypto'),(136,'EOS/USD','Crypto'),(137,'ETH/USD','Crypto'),(138,'ETC/USD','Crypto'),(139,'GNO/USD','Crypto'),(140,'ICX/USD','Crypto'),(141,'KNC/USD','Crypto'),(142,'LSK/USD','Crypto'),(143,'LTC/USD','Crypto'),(144,'XMR/USD','Crypto'),(145,'OMG/USD','Crypto'),(146,'XRP/USD','Crypto'),(147,'SC/USD','Crypto'),(148,'XLM/USD','Crypto'),(149,'STORJ/USD','Crypto'),(150,'USDT/USD','Crypto'),(151,'XTZ/USD','Crypto'),(152,'TRX/USD','Crypto'),(153,'WAVES/USD','Crypto'),(154,'ZED/USD','Crypto');
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
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,1,'A very simple plan','2020-10-23 15:10:14','Kraken','TV','10000','','',0,'','','',''),(2,1,'SAMPLE','2020-10-27 18:57:32','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(3,1,'SAMPLE','2020-10-27 18:57:40','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(4,1,'SAMPLE','2020-10-27 18:57:41','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(5,1,'SAMPLE','2020-10-27 18:57:41','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(6,1,'SAMPLE','2020-10-27 18:57:41','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(7,1,'SAMPLE','2020-10-27 18:57:41','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(8,1,'SAMPLE','2020-10-27 18:57:41','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(9,1,'SAMPLE','2020-10-27 18:57:41','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(10,1,'SAMPLE','2020-10-27 18:57:41','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(11,1,'SAMPLE','2020-10-27 18:57:42','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(12,1,'SAMPLE','2020-10-27 18:57:42','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(13,1,'SAMPLE','2020-10-27 18:57:42','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(14,1,'SAMPLE','2020-10-27 18:57:42','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(15,1,'SAMPLE','2020-10-27 18:57:42','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(16,1,'SAMPLE','2020-10-27 18:57:42','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(17,1,'SAMPLE','2020-10-27 18:57:42','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(18,1,'SAMPLE','2020-10-27 18:57:43','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(19,1,'SAMPLE','2020-10-27 18:57:43','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(20,1,'SAMPLE','2020-10-27 18:57:43','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(21,1,'SAMPLE','2020-10-27 18:57:43','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(22,1,'SAMPLE','2020-10-27 18:57:43','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(23,1,'SAMPLE','2020-10-27 18:57:43','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(24,1,'SAMPLE','2020-10-27 18:57:43','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(25,1,'SAMPLE','2020-10-27 18:57:44','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(26,1,'SAMPLE','2020-10-27 18:57:44','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(27,1,'SAMPLE','2020-10-27 18:57:44','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(28,1,'SAMPLE','2020-10-27 18:57:44','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(29,1,'SAMPLE','2020-10-27 18:57:44','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(30,1,'SAMPLE','2020-10-27 18:57:44','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(31,1,'SAMPLE','2020-10-27 18:57:45','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(32,1,'SAMPLE','2020-10-27 18:57:45','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(33,1,'SAMPLE','2020-10-27 18:57:45','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(34,1,'SAMPLE','2020-10-27 18:57:45','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(35,1,'SAMPLE','2020-10-27 18:57:45','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(36,1,'SAMPLE','2020-10-27 18:57:45','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(37,1,'SAMPLE','2020-10-27 18:57:46','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(38,1,'SAMPLE','2020-10-27 18:57:46','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(39,1,'SAMPLE','2020-10-27 18:57:46','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(40,1,'SAMPLE','2020-10-27 18:57:46','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(41,1,'SAMPLE','2020-10-27 18:57:46','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(42,1,'SAMPLE','2020-10-27 18:57:46','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(43,1,'SAMPLE','2020-10-27 18:57:47','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(44,1,'SAMPLE','2020-10-27 18:57:47','Some Broker','Some Charts',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL);
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
  UNIQUE KEY `strategy` (`strategy`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `strategies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `strategies`
--

LOCK TABLES `strategies` WRITE;
/*!40000 ALTER TABLE `strategies` DISABLE KEYS */;
INSERT INTO `strategies` VALUES (49,'A new',8),(3,'Ascending Triangle',1),(5,'Dinosaur Pattern',1),(2,'Double Bottom',1),(1,'None',1),(45,'None',7),(48,'None',8);
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
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pair_id` (`pair_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tanalysis_ibfk_1` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`),
  CONSTRAINT `tanalysis_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tanalysis`
--

LOCK TABLES `tanalysis` WRITE;
/*!40000 ALTER TABLE `tanalysis` DISABLE KEYS */;
INSERT INTO `tanalysis` VALUES (1,'Forex',1,'2020-03-23',1,'2020-11-15 10:39:33'),(2,'Forex',2,'2020-03-23',1,'2020-11-15 10:39:33'),(3,'Forex',115,'2020-10-27',1,'2020-11-15 10:39:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telementanalysis`
--

LOCK TABLES `telementanalysis` WRITE;
/*!40000 ALTER TABLE `telementanalysis` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'shyvama','oriolripaltaimaso@gmail.com','Oriol','Ripalta Maso','en',3,'$2b$10$.4zYMyUWYKogR.zubtywO.xXh5QpCnSozdlNM6epLlZe7xcCFgRoq','2020-10-13 16:04:46',2,10000.0000,1,0,'a4d3eeea7b7745cf3dbd2b263420a6a9325eda83','2020-12-10 23:44:41',NULL,NULL,NULL),(2,'mmmitusss','gelabertgalmes98@gmail.com','Jaume','Gelabert Galmes','en',3,'$2b$10$3zqVeJt9UlMAK6zonCrEcexMPqw0GXatlxH059gbvFQB5DJAGI5uW','2020-10-13 16:04:46',2,0.0000,0,0,NULL,NULL,NULL,NULL,NULL),(3,'Empty','empty@empty.com','Empty','Empty Empty','es',1,'$2b$10$jyrdv1yvVp27Y43lrVdqrua0h5Fh0qpjhlFPyX64NfNt4xGXfKNQq','2020-10-21 08:08:22',1,123.0000,0,0,NULL,NULL,NULL,NULL,NULL),(4,'maso@gmail.com','maso@gmail.com','Oriol','Maso','en',1,'$2b$10$A2OkloT0pgK0Jyw6z0zZj.SeY1GYYGqzEp8aISIAuxHDEXHDMErzu','2020-11-23 11:18:22',3,1.0000,0,0,NULL,NULL,NULL,NULL,NULL),(5,'Mum','mum@hotmail.com','Mum','Mum','en',1,'$2b$10$etGEChH/qEyBVvJEBI9/U.qaxKE066ExSCkwGIun/yyL7T5cQT6Y.','2020-11-23 11:24:41',3,1.0000,0,0,NULL,NULL,NULL,NULL,NULL),(6,'Dad','dad@hotmail.com','Dad','Dad','en',1,'$2b$10$bQiEZ0BlFjLkQAaHfz2NweyxaQZvOAxgmd7E/NzxcgaO3YrIjEMp2','2020-11-23 11:28:30',3,2.0000,0,0,NULL,NULL,NULL,NULL,NULL),(7,'Bro','bro@hotmailcom','Bro','Bro','en',1,'$2b$10$YAMKgfnsaTox4pWMd5ZUdOB4qL1nAjspUgm4o62bU02ZfVxbuU/Xm','2020-11-23 11:31:45',5,3.0000,0,0,NULL,NULL,NULL,NULL,NULL),(8,'Ban Bunny','badbunny@gmail.com','Bad','Bunny','en',1,'$2b$10$ifON5f1PvK3Wfhkpe7jipu4D8MoambCCHw3GCWMp0kjw.jo5YgIjO','2020-11-27 20:40:52',4,1000.0000,0,0,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `users_deserialize`
--

DROP TABLE IF EXISTS `users_deserialize`;
/*!50001 DROP VIEW IF EXISTS `users_deserialize`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `users_deserialize` AS SELECT
 1 AS `id`,
 1 AS `username`,
 1 AS `email`,
 1 AS `name`,
 1 AS `surname`,
 1 AS `language`,
 1 AS `role_id`,
 1 AS `created_at`,
 1 AS `currency_id`,
 1 AS `balance`,
 1 AS `showProfits`,
 1 AS `darkMode`,
 1 AS `stripeCustomerId`,
 1 AS `stripeSubscriptionId`,
 1 AS `stripeProductId`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `users_deserialize`
--

/*!50001 DROP VIEW IF EXISTS `users_deserialize`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50001 VIEW `users_deserialize` AS select `users`.`id` AS `id`,`users`.`username` AS `username`,`users`.`email` AS `email`,`users`.`name` AS `name`,`users`.`surname` AS `surname`,`users`.`language` AS `language`,`users`.`role_id` AS `role_id`,`users`.`created_at` AS `created_at`,`users`.`currency_id` AS `currency_id`,`users`.`balance` AS `balance`,`users`.`showProfits` AS `showProfits`,`users`.`darkMode` AS `darkMode`,`users`.`stripeCustomerId` AS `stripeCustomerId`,`users`.`stripeSubscriptionId` AS `stripeSubscriptionId`,`users`.`stripeProductId` AS `stripeProductId` from `users` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-12-13 17:54:20
