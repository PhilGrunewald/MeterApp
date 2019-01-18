-- MySQL dump 10.13  Distrib 5.7.24, for Linux (x86_64)
--
-- Host: localhost    Database: Meter
-- ------------------------------------------------------
-- Server version	5.7.24-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Activities`
--

DROP TABLE IF EXISTS `Activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Activities` (
  `idActivities` int(11) NOT NULL AUTO_INCREMENT,
  `Meta_idMeta` int(11) NOT NULL,
  `dt_activity` datetime DEFAULT NULL,
  `dt_recorded` datetime DEFAULT NULL COMMENT 'The time at which the activity was reported. If a request for an activity entry was requested at Time=13:53, this time remains shown on the display, but participants can report what happened at Time later (at TimeEntered)',
  `tuc` int(11) NOT NULL DEFAULT '0',
  `activity` varchar(100) DEFAULT NULL,
  `location` int(3) DEFAULT '0' COMMENT '1	home\n2	travelling\n3	work\n4	public place\n5	outdoors\n6	other\n0	not specified',
  `enjoyment` varchar(15) DEFAULT '0' COMMENT '1	not at all\n2	not very much\n3	neutral\n4	somewhat\n5	very much\n0	not specified\nundefined		= not specified',
  `category` varchar(45) DEFAULT NULL,
  `people` int(3) DEFAULT '-1',
  `path` varchar(600) DEFAULT NULL,
  `key` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idActivities`)
) ENGINE=InnoDB AUTO_INCREMENT=37685 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Categories` (
  `tuc` int(11) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `e_cat` varchar(100) DEFAULT NULL,
  `hiE` int(1) DEFAULT '0',
  PRIMARY KEY (`tuc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Contact`
--

DROP TABLE IF EXISTS `Contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Contact` (
  `idContact` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) DEFAULT NULL,
  `Surname` varchar(45) DEFAULT NULL,
  `Address1` varchar(150) DEFAULT NULL,
  `Address2` varchar(45) DEFAULT NULL,
  `Town` varchar(45) DEFAULT NULL,
  `Postcode` varchar(8) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `recorded` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idContact`)
) ENGINE=InnoDB AUTO_INCREMENT=7825 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DataTypes`
--

DROP TABLE IF EXISTS `DataTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DataTypes` (
  `idDataTypes` varchar(3) NOT NULL,
  `dataType` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idDataTypes`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `El_hour`
--

DROP TABLE IF EXISTS `El_hour`;
/*!50001 DROP VIEW IF EXISTS `El_hour`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `El_hour` AS SELECT 
 1 AS `dt`,
 1 AS `Meta_idMeta`,
 1 AS `Watt`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Electricity`
--

DROP TABLE IF EXISTS `Electricity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Electricity` (
  `idElectricity` bigint(20) NOT NULL AUTO_INCREMENT,
  `dt` datetime DEFAULT NULL,
  `Watt` float DEFAULT NULL,
  `Meta_idMeta` int(11) DEFAULT NULL,
  PRIMARY KEY (`idElectricity`)
) ENGINE=MyISAM AUTO_INCREMENT=43435836 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `Electricity_10min`
--

DROP TABLE IF EXISTS `Electricity_10min`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Electricity_10min` (
  `dt` datetime DEFAULT NULL,
  `Meta_idMeta` bigint(20) DEFAULT NULL,
  `Watt` double DEFAULT NULL,
  `idElectricity` bigint(20) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idElectricity`),
  KEY `ix_Electricity_10min_dt` (`dt`)
) ENGINE=InnoDB AUTO_INCREMENT=5938616 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Electricity_1min`
--

DROP TABLE IF EXISTS `Electricity_1min`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Electricity_1min` (
  `idElectricity` bigint(20) NOT NULL AUTO_INCREMENT,
  `dt` datetime DEFAULT NULL,
  `Meta_idMeta` bigint(20) DEFAULT NULL,
  `Watt` double DEFAULT NULL,
  PRIMARY KEY (`idElectricity`),
  KEY `ix_Electricity_10min_dt` (`dt`)
) ENGINE=InnoDB AUTO_INCREMENT=791998 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `Household`
--

DROP TABLE IF EXISTS `Household`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Household` (
  `idHousehold` int(11) NOT NULL AUTO_INCREMENT,
  `Contact_idContact` int(11) NOT NULL DEFAULT '0',
  `security_code` varchar(45) DEFAULT '123',
  `page_number` int(3) DEFAULT '0' COMMENT 'stores how far in the survey the participant got (where to pick up)',
  `people` int(3) DEFAULT '0',
  `age_group1` int(3) DEFAULT '0',
  `age_group2` int(3) DEFAULT '0',
  `age_group3` int(3) DEFAULT '0',
  `age_group4` int(3) DEFAULT '0',
  `age_group5` int(3) DEFAULT '0',
  `age_group6` int(3) DEFAULT '0',
  `pet1` int(3) DEFAULT '0' COMMENT 'Dog',
  `pet2` int(3) DEFAULT '0' COMMENT 'Cat',
  `pet3` int(3) DEFAULT '0' COMMENT 'Fish\\n',
  `pet4` varchar(45) DEFAULT '' COMMENT 'free text',
  `p6pm` int(3) DEFAULT '-1',
  `house_type` int(3) DEFAULT '0',
  `house_type_other` varchar(45) DEFAULT NULL,
  `rooms` int(3) DEFAULT '0',
  `own` tinyint(1) DEFAULT '0',
  `appliance_bo` varchar(45) DEFAULT NULL,
  `appliance_b11` int(3) DEFAULT '0',
  `appliance_b10` int(3) DEFAULT '0',
  `appliance_b9` int(3) DEFAULT '0',
  `appliance_b8` int(3) DEFAULT '0',
  `appliance_b7` int(3) DEFAULT '0',
  `appliance_b6` int(3) DEFAULT '0',
  `appliance_b5` int(3) DEFAULT '0',
  `appliance_b4` int(3) DEFAULT '0',
  `appliance_b3` int(3) DEFAULT '0',
  `appliance_b2` int(3) DEFAULT '0',
  `appliance_b1` int(3) DEFAULT '0',
  `appliance1` int(3) DEFAULT '0',
  `appliance2` int(3) DEFAULT '0',
  `appliance3` int(3) DEFAULT '0',
  `appliance4` int(3) DEFAULT '0',
  `appliance5` int(3) DEFAULT '0',
  `appliance6` int(3) DEFAULT '0',
  `appliance7` int(3) DEFAULT '0',
  `appliance8` int(3) DEFAULT '0',
  `provider` varchar(45) DEFAULT 'not given',
  `tariff` int(3) DEFAULT '0',
  `bill_monthly` tinyint(1) DEFAULT '0' COMMENT 'This is merely how they chose to answer the question what their bill is: i.e. in monthly figures or annual ones.',
  `bill_range` int(3) DEFAULT '0',
  `bill_uncertain` tinyint(1) DEFAULT '0',
  `income` int(3) DEFAULT '0',
  `inc_monthly` tinyint(1) DEFAULT '0',
  `bill_affordable` int(3) DEFAULT '0',
  `date_choice` date DEFAULT '2000-01-01',
  `comment` blob,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` int(3) DEFAULT '0' COMMENT '0 needs kit\n1 kit ready / in the field\n2 kit returned',
  `study` int(3) DEFAULT '0' COMMENT 'NULL = unknown - should not be any nulls\n0 = the new default (no study attribution)\n1 = early trials - ones 24 hours\n2 = paper diaries - 28 hours\n3 = app on android phones\n4 = WOSC',
  `reference` int(3) DEFAULT '0',
  `referee` varchar(80) DEFAULT NULL,
  `intervention` int(3) DEFAULT '0' COMMENT '0 = None\n1 = use less between 5 and 7 pm on second day',
  PRIMARY KEY (`idHousehold`),
  KEY `fk_Household_Contact1_idx` (`Contact_idContact`),
  CONSTRAINT `fk_Household_Contact1` FOREIGN KEY (`Contact_idContact`) REFERENCES `Contact` (`idContact`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=11407 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Individual`
--

DROP TABLE IF EXISTS `Individual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Individual` (
  `idIndividual` int(11) NOT NULL AUTO_INCREMENT,
  `Meta_idMeta` int(11) NOT NULL,
  `Gender` int(1) DEFAULT '0' COMMENT '1 female\n2 male\n3 other\n0 not specified',
  `Age_range` int(1) DEFAULT '0' COMMENT '1	under 8 (not possible - just for consistency with hhq)\n2	8-18\n3	19-34\n4	35-50\n5	51-70\n6	over 70\n0	not specified\n',
  `Occupation` int(1) DEFAULT '0' COMMENT '1	Student\n2	Employed\n3	Self-employed\n4	Volunteer / unpaid\n5	Unemployed / retired\n0	not specified\n',
  `WorkingHours` int(1) DEFAULT '0' COMMENT '1	0 hours (not an option in the app)\n2	0-10\n3	10-20\n4	20-30\n5	30-40\n6	40-50\n7	over 50\n0	not specified',
  `WorkRegularity` int(1) DEFAULT '0' COMMENT '1	always the same\n2	mostly the same\n3	variable to suit work\n4	flexible to suit me\n0	not specified',
  `WorkHome` int(1) DEFAULT '0' COMMENT '1	never\n2	rarely\n3	sometimes\n4	often\n5	always\n0	not specified',
  `BillContributer` int(1) DEFAULT '0' COMMENT '1	Yes, I do\n2	Yes, I contribute\n3	No, I don’t\n4	Other\n0	not specified',
  `Income` int(1) DEFAULT '0' COMMENT '1	0-10k\n2	10-20\n3	20-30\n4	30-45\n5	>45\n0	not specified',
  `UseDishwasher` int(1) DEFAULT '0' COMMENT '1	I did’t\n2	Once\n3	Twice\n4	3-4\n5	5-7\n6	8+',
  `UseWashingMachine` int(1) DEFAULT '0' COMMENT '1	I did’t\n2	Once\n3	Twice\n4	3-4\n5	5-7\n6	8+',
  `UseTumbleDryer` int(1) DEFAULT '0' COMMENT '1	I did’t\n2	Once\n3	Twice\n4	3-4\n5	5-7\n6	8+',
  `UseShower` int(1) DEFAULT '0' COMMENT '1	I did’t\n2	Once\n3	Twice\n4	3-4\n5	5-7\n6	8+',
  `UseVacuumCleaner` int(1) DEFAULT '0' COMMENT '1	I did’t\n2	Once\n3	Twice\n4	3-4\n5	5-7\n6	8+',
  `TimeMobile` int(1) DEFAULT '0' COMMENT 'Time per day\n1	None\n2	10 min or less\n3	30 min or less\n4	1h or less\n5	3 hours or less\n6	Over 3 hours',
  `TimeScreens` int(1) DEFAULT '0' COMMENT 'Time per day\n1	None\n2	10 min or less\n3	30 min or less\n4	1h or less\n5	3 hours or less\n6	Over 3 hours',
  `TimeCooking` int(1) DEFAULT '0' COMMENT 'Time per day\n1	None\n2	10 min or less\n3	30 min or less\n4	1h or less\n5	3 hours or less\n6	Over 3 hours',
  `TimeExercise` int(1) DEFAULT '0' COMMENT 'Time per day\n1	None\n2	10 min or less\n3	30 min or less\n4	1h or less\n5	3 hours or less\n6	Over 3 hours\n',
  `TimeOfDiary` int(1) DEFAULT '0' COMMENT 'When did you fill in the diary?\n1 = Now and then during the day\n2 = At the end of the day\n3 = After the diary day',
  `Rushed` tinyint(1) DEFAULT NULL COMMENT 'Did you feel rushed this day?\n0 = No\n1 = Yes',
  `UnusualDay` tinyint(1) DEFAULT NULL COMMENT 'Was this an ordinary or and unusual day?\n0 = An ordinary day\n1 = An unusual day\n',
  `DifficultyMeter` tinyint(1) DEFAULT NULL COMMENT 'Did you have difficulty fitting the electricity recorder?\n0 = No\n1 = Yes',
  `ConsentShare` tinyint(1) DEFAULT '0' COMMENT '1= yes\n',
  `EnergyInterest` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idIndividual`)
) ENGINE=InnoDB AUTO_INCREMENT=1616 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Legend`
--

DROP TABLE IF EXISTS `Legend`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Legend` (
  `idLegend` int(11) NOT NULL AUTO_INCREMENT,
  `tab` varchar(45) DEFAULT NULL,
  `col` varchar(45) DEFAULT NULL,
  `value` varchar(45) DEFAULT NULL,
  `meaning` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idLegend`)
) ENGINE=InnoDB AUTO_INCREMENT=1148 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Meta`
--

DROP TABLE IF EXISTS `Meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Meta` (
  `idMeta` int(11) NOT NULL AUTO_INCREMENT COMMENT 'file name of original data file can be reconstructed as:\ndate _SN_DataType\ni.e.\n2012-12-24_01234567_E.csv',
  `SerialNumber` varchar(60) DEFAULT NULL COMMENT '0:  paper diary\\\\n1..n: aMeter provided by study \\\\nxxyyd:\\\\n	xx: month of study an eMeter was configured\\\\n	yy: incremental number 1..n (for that month)\\\\n	d: day of week to start (0 = Sunday)\\\\n16 digit alpha-numerical code: app installed on participants mobile device',
  `CollectionDate` date DEFAULT NULL,
  `DataType` varchar(150) DEFAULT NULL COMMENT 'E=Electricity\nH=HouseholdSurvey\nI=IndividualSurvey\nD=Diary\nT=Tempetature\nL=LightLevel\nM=Meta\nO=Other\n\nCSV: platform, cordova version, model, version, manufacturer, serial number ',
  `Household_idHousehold` int(11) DEFAULT NULL,
  `Quality` int(11) DEFAULT NULL COMMENT '2 = good after processing\n1 = good (pre validation)\n0 = fail\n-1 = no survey\n-2 = no activities\n-3 = neither survey nor activities',
  `uploaded` datetime DEFAULT NULL,
  `authorised` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`idMeta`)
) ENGINE=InnoDB AUTO_INCREMENT=3896 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `dateAvailable`
--

DROP TABLE IF EXISTS `dateAvailable`;
/*!50001 DROP VIEW IF EXISTS `dateAvailable`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `dateAvailable` AS SELECT 
 1 AS `trialdate`,
 1 AS `count`,
 1 AS `places`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `dateSelection`
--

DROP TABLE IF EXISTS `dateSelection`;
/*!50001 DROP VIEW IF EXISTS `dateSelection`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `dateSelection` AS SELECT 
 1 AS `date_choice`,
 1 AS `c`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `dates`
--

DROP TABLE IF EXISTS `dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dates` (
  `iddates` int(11) NOT NULL AUTO_INCREMENT,
  `trialdate` date DEFAULT NULL,
  `bookings` int(3) DEFAULT '0',
  `places` int(3) DEFAULT '3' COMMENT 'How many devices are we willing to give out on this day?\nGets compared to the allocated places in Views - dateSelection',
  PRIMARY KEY (`iddates`)
) ENGINE=InnoDB AUTO_INCREMENT=484 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `tuc`
--

DROP TABLE IF EXISTS `tuc`;
/*!50001 DROP VIEW IF EXISTS `tuc`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `tuc` AS SELECT 
 1 AS `tuc`,
 1 AS `meaning`,
 1 AS `category`*/;
SET character_set_client = @saved_cs_client;


-- Dump completed on 2019-01-18 11:56:25
