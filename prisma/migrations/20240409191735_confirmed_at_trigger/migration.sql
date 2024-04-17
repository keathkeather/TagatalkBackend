CREATE OR REPLACE FUNCTION update_confirmed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set confirmed_at to the minimum value between email_confirmed_at and phone_confirmed_at
  NEW.confirmed_at := LEAST(NEW.email_confirmed_at, NEW.phone_confirmed_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_confirmed_at
BEFORE INSERT OR UPDATE OF email_confirmed_at, phone_confirmed_at
ON "Auth"
FOR EACH ROW
EXECUTE FUNCTION update_confirmed_at();

