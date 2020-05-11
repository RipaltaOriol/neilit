-- SELECT * FROM users
-- JOIN tanalysis
-- ON users.id = tanalysis.user_id
-- WHERE users.id = 2;

-- SELECT * FROM tanalysis
-- JOIN pairs
-- ON tanalysis.pair_id = pairs.id
-- order by created_at desc
-- LIMIT 7
-- ;
--
-- SET lc_time_names = 'es_ES';
-- SELECT DATE_FORMAT(created_at, "%d de %M %Y") as fecha from tanalysis;

-- query used to show the specifics of a particular TA
SELECT * FROM tanalysis
JOIN pairs
ON tanalysis.pair_id = pairs.id
WHERE tanalysis.id = 1
;

SELECT * FROM tanalysis
JOIN telementanalysis
ON tanalysis.id = telementanalysis.ta_id
WHERE tanalysis.id = 1;

SELECT * FROM telementanalysis
JOIN telements
ON telementanalysis.element_id = telements.id
WHERE telementanalysis.ta_id = 1;
