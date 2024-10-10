-- This is an empty migration.

CREATE VIEW UserRankView as 
SELECT "userId", RANK() OVER (ORDER BY "userPoints" DESC) as rank
FROM "User";