CREATE OR REPLACE FUNCTION create_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "User" (id, email) 
    VALUES (NEW.authId, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_trigger
AFTER INSERT ON "Auth"
FOR EACH ROW
EXECUTE FUNCTION create_user();