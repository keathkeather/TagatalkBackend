-- This is an empty migration.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

-- Add a policy that allows users to only select their own records
CREATE POLICY user_self_policy ON "User" 
  FOR SELECT 
  USING ("id" = current_setting('app.current_user_id', TRUE));