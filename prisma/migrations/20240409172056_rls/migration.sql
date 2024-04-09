-- Enable Row-Level Security on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Auth" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User_Progress" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Auth" FORCE ROW LEVEL SECURITY;

--* POLICIES--
CREATE POLICY "enable_all_actions_in_USER_table_based_on_ID" ON "User" 
    FOR ALL
    USING ("authId" = current_setting('app.current_user_id')::uuid); 

CREATE POLICY "enable_all_actions_in_AUTH_table_based_on_ID" ON "Auth"
    FOR ALL
    USING ("authId" = current_setting('app.current_user_id')::uuid);

CREATE POLICY "enable_all_actions_in_USER_PROGRESS_table_based_on_ID" ON "User_Progress"
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id')::uuid); 



