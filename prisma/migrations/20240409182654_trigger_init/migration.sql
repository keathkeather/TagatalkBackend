CREATE OR REPLACE FUNCTION set_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email := LOWER(NEW.identity_data ->> 'email'); -- Convert email to lowercase
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_email
BEFORE INSERT ON identities
FOR EACH ROW
EXECUTE FUNCTION set_email();


