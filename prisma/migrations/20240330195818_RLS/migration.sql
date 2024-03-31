-- Enable Row Level Security for each table
ALTER TABLE "User_Progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for each table
ALTER TABLE "User_Progress" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Report" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Feedback" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Notification" FORCE ROW LEVEL SECURITY;

-- Create row security policies for User_Progress table
CREATE POLICY user_progress_isolation_policy ON "User_Progress" FOR ALL
USING (
  "userId" = current_setting('app.current_user_id', TRUE)
);

-- Create row security policies for Report table
CREATE POLICY report_isolation_policy ON "Report" FOR ALL
USING (
  "userId" = current_setting('app.current_user_id', TRUE)
);

-- Create row security policies for Feedback table
CREATE POLICY feedback_isolation_policy ON "Feedback" FOR ALL
USING (
  "userId" = current_setting('app.current_user_id', TRUE)
);

-- Create row security policies for Notification table
CREATE POLICY notification_isolation_policy ON "Notification" FOR ALL
USING (
  "userId" = current_setting('app.current_user_id', TRUE)
);