-- This migration updates the UserRankView to exclude admin users.

CREATE OR REPLACE VIEW UserRankView AS 
SELECT "userId", RANK() OVER (ORDER BY "userPoints" DESC) AS rank
FROM "User"
WHERE "isAdmin" = false;