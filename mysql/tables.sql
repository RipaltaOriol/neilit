-- Learn how to drop tables simultaneously
-- Involving foreign refrences
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS telementanalysis;
DROP TABLE IF EXISTS telements;
DROP TABLE IF EXISTS pairs;
DROP TABLE IF EXISTS strategies;
DROP TABLE IF EXISTS strategies_timeframes;
DROP TABLE IF EXISTS tanalysis;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS entries;
DROP TABLE IF EXISTS comments;

SET FOREIGN_KEY_CHECKS = 1;



CREATE TABLE users
  (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    username VARCHAR(40) NOT NULL,
    email VARCHAR(40) NOT NULL,
    name VARCHAR(40) NOT NULL,
    surname VARCHAR(40) NOT NULL,
    password VARCHAR(4000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
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

CREATE TABLE strategies_timeframes
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
  FOREIGN KEY (ta_id) REFERENCES tanalysis(id),
  FOREIGN KEY (element_id) REFERENCES telements(id)
);

CREATE TABLE entries
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  pair_id INT NOT NULL,
  category VARCHAR(20) NOT NULL,
  size DOUBLE NOT NULL,
  strategy_id INT NOT NULL,
  entry_dt TIMESTAMP NOT NULL DEFAULT NOW(),
  exit_dt TIMESTAMP,
  direction VARCHAR(5) NOT NULL, -- this column might not be necessary
  entry_price DECIMAL(8,5) NOT NULL,
  stop_loss DECIMAL(8,5) NOT NULL,
  take_profit DECIMAL(8,5) NOT NULL,
  exit_price DECIMAL(8,5),
  ta_id INT,
  status BOOLEAN DEFAULT false,
  comment VARCHAR(4000),
  result VARCHAR(10),
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
  comment VARCHAR(4000) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
