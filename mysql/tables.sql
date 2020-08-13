-- Learn how to drop tables simultaneously
-- Involving foreign refrences
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS backtest_addons_data;
DROP TABLE IF EXISTS backtest_data;
DROP TABLE IF EXISTS backtest_addons;
DROP TABLE IF EXISTS backtest;
DROP TABLE IF EXISTS telementanalysis;
DROP TABLE IF EXISTS telements;
DROP TABLE IF EXISTS pairs;
DROP TABLE IF EXISTS strategies;
DROP TABLE IF EXISTS tanalysis;
DROP TABLE IF EXISTS entries;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS timeframes;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS currencies;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- DB Tables
CREATE TABLE roles
  (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    role VARCHAR(40) NOT NULL
  );

CREATE TABLE currencies
  (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    currency VARCHAR(3) NOT NULL
  );

CREATE TABLE users
  (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    username VARCHAR(40) NOT NULL,
    email VARCHAR(40) NOT NULL,
    name VARCHAR(40) NOT NULL,
    surname VARCHAR(40) NOT NULL,
    role_id INT NOT NULL,
    password VARCHAR(4000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expiration TIMESTAMP DEFAULT NULL,
    currency_id INT NOT NULL,
    balance DECIMAL(10,4) NOT NULL,
    dark_mode BOOLEAN DEFAULT false NOT NULL,
    sound BOOLEAN DEFAULT false NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (currency_id) REFERENCES currencies(id)
  );

CREATE TABLE pairs
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  pair VARCHAR(11) NOT NULL,
  category VARCHAR(14) NOT NULL
);

CREATE TABLE strategies
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  strategy VARCHAR (50),
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- missing/not taking into account the strategy importance
-- only 2 values are possible

CREATE TABLE goals
  (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    goal VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

CREATE TABLE timeframes
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  timeframe VARCHAR (10) NOT NULL
);

CREATE TABLE telements
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  type VARCHAR(15) NOT NULL
);

CREATE TABLE tanalysis
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  category VARCHAR(20) NOT NULL,
  pair_id INT NOT NULL,
  created_at DATE NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (pair_id) REFERENCES pairs(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE telementanalysis
(
  ta_id INT NOT NULL,
  order_at INT NOT NULL,
  element_id INT NOT NULL,
  content VARCHAR(4000),
  file BLOB,
  strategy_id INT,
  timeframe_id INT,
  FOREIGN KEY (ta_id) REFERENCES tanalysis(id),
  FOREIGN KEY (element_id) REFERENCES telements(id),
  FOREIGN KEY (strategy_id) REFERENCES strategies(id),
  FOREIGN KEY (timeframe_id) REFERENCES timeframes(id)
);

CREATE TABLE entries
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  pair_id INT NOT NULL,
  category VARCHAR(20) NOT NULL,
  size DOUBLE NOT NULL,
  strategy_id INT NOT NULL,
  timeframe_id INT NOT NULL,
  entry_dt TIMESTAMP NOT NULL DEFAULT NOW(),
  exit_dt TIMESTAMP,
  direction ENUM('long', 'short') NOT NULL, -- this column might not be necessary
  entry_price DECIMAL(8,5) NOT NULL,
  stop_loss DECIMAL(8,5),
  take_profit DECIMAL(8,5),
  exit_price DECIMAL(8,5),
  ta_id INT,
  status BOOLEAN DEFAULT false NOT NULL,
  comment VARCHAR(4000),
  result ENUM('win', 'loss', 'be'),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pair_id) REFERENCES pairs(id),
  FOREIGN KEY (strategy_id) REFERENCES strategies(id),
  FOREIGN KEY (ta_id) REFERENCES tanalysis(id)
);

CREATE TABLE comments
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  comment VARCHAR(4000),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE backtest
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  pair_id INT,
  direction ENUM('long', 'short'),
  result ENUM('%', 'R') NOT NULL,
  strategy_id INT,
  timeframe_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pair_id) REFERENCES pairs(id),
  FOREIGN KEY (strategy_id) REFERENCES strategies(id),
  FOREIGN KEY (timeframe_id) REFERENCES timeframes(id)
);

CREATE TABLE backtest_addons
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  backtest_id INT NOT NULL,
  description VARCHAR(1000) NOT NULL,
  is_integers BOOLEAN DEFAULT false NOT NULL,
  option1 VARCHAR(1000),
  option2 VARCHAR(1000),
  option3 VARCHAR(1000),
  option4 VARCHAR(1000),
  option5 VARCHAR(1000),
  option6 VARCHAR(1000),
  FOREIGN KEY (backtest_id) REFERENCES backtest(id)
);

CREATE TABLE backtest_data
(
  identifier INT NOT NULL,
  backtest_id INT NOT NULL,
  direction ENUM('long', 'short'),
  result FLOAT NOT NULL,
  pair_id INT,
  strategy_id INT,
  timeframe_id INT,
  FOREIGN KEY (backtest_id) REFERENCES backtest(id),
  FOREIGN KEY (pair_id) REFERENCES pairs(id),
  FOREIGN KEY (strategy_id) REFERENCES strategies(id),
  FOREIGN KEY (timeframe_id) REFERENCES timeframes(id)
);

CREATE TABLE backtest_addons_data
(
  backtest_id INT NOT NULL,
  backtest_data_id INT NOT NULL,
  backtest_addons_id INT NOT NULL,
  addon_value FLOAT, -- it can be a integer value or an option value
  FOREIGN KEY (backtest_id) REFERENCES backtest(id),
  FOREIGN KEY (backtest_addons_id) REFERENCES backtest_addons(id)
);
