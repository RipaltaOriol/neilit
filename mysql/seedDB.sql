INSERT INTO users (username, email, name, surname, password)
VALUES
  ('shyvama', 'oriolripaltaimaso@gmail.com', 'Oriol', 'Ripalta Maso', '123'),
  ('mmmitusss', 'gelabertgalmes98@gmail.com', 'Jaume', 'Gelabert Galmes', '636192508Aa+');

INSERT INTO strategies (strategy, user_id)
VALUES
  ('Head & Shoulders', 1),
  ('Double Bottom', 1),
  ('Ascending Triangle', 1),
  ('Cup & Handle', 1),
  ('Dinosaur Pattern', 1);

INSERT INTO strategies_timeframes (timeframe)
VALUES
  ("1 minute"), ("3 minutes"), ("5 minutes"), ("15 minutes"), ("30 minutes"), ("45 minute"), ("1 hour"),
  ("2 hours"), ("3 hours"), ("4 hours"), ("12 hours"), ("1 day"), ("1 week"), ("1 month");

INSERT INTO telements (type)
VALUES
  ('title'),
  ('image'),
  ('text'),
  ('strategy');

INSERT INTO tanalysis (category, pair_id, created_at, user_id)
VALUES
  ('Forex', 1, '2020-03-23', 1),
  ('Forex', 2, '2020-03-23', 1);

INSERT INTO telementanalysis (ta_id, order_at, element_id, content)
VALUES
  (1, 1, 1, 'More on weekly forecasting and trading'),
  (1, 2, 1, 'Forecasting'),
  (1, 3, 1, ''),
  (1, 4, 3, 'LINK/EUR, ascending channel on the 4-hour charts (the daily doesn''t look that good). There is a potential bounce from the bottom of the trend-line and 21EMA. I am also actively looking for a cup &amp
    ; handle pattern. The SL is quite big on 9%.<span style="font-size: 1rem;">&nbsp;</span>'),
  (1, 5, 4, 'Cup & Handle$general$4 hours'),
  (1, 6, 4, 'Double Bottom$trigger$4 hours'),
  (2, 1, 3, 'Utilice este espacio para escribir algún comentario adicional'),
  (2, 2, 1, 'Wednesday, 18 March 2020'),
  (2, 3, 1, 'Forecasting (1st of day)'),
  (2, 4, 3, 'The LTC failed to break the 21EMA towards the upside. The price managed to close one candle above the 21EMA in the 4-hour charts, but went back down. I am looking for a possible re-test of the bottom support for the following days.'),
  (2, 5, 4, 'Double Bottom$general$4 hours');

INSERT INTO entries (user_id, pair_id, category, size, strategy_id, entry_dt, exit_dt, direction, entry_price, stop_loss, take_profit, exit_price, ta_id, status, comment, result)
VALUES
  (1, 121, 'Forex', 1, 4, '2019-04-23 17:30:00', '2019-04-23 00:00:00', 'long', 107.199, 106.920, 107.960, 107.960, 1, true, "Nailed this trade!", 'win'),
  (1, 60, 'Forex', 0.1, 1, '2019-04-27 09:45:00', '2019-04-27 13:00:00', 'short', 1.52485, 1.52677, 1.51566, 1.52485, 2, true, 'Retrace to the triangle neck. Give more room to the SL (not so tight).', 'loss');

INSERT INTO entries (user_id, pair_id, category, size, strategy_id, entry_dt, direction, entry_price, stop_loss, take_profit)
VALUES
  (1, 50, 'Forex', 10.01, 5, '2019-04-27 18:08:56', 'long', 1.67585, 1.69423, 1.72414);

INSERT INTO comments (user_id, comment)
VALUES
  (1, 'This is the first comment ever inside NEILIT'),
  (1, "I'm a consistently successful trader!"),
  (1, 'What you just read is my trading mantra');
