CREATE OR REPLACE FUNCTION create_user_on_auth_insert()
RETURNS TRIGGER AS
$$
BEGIN
  -- Insert into User table using the generated authId as userId
  
  INSERT INTO "User" ("userId", "email" ,"updatedAt")
  VALUES ( NEW."authId",NEW."email",NOW());
  
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER auth_insert_trigger
AFTER INSERT ON "Auth"
FOR EACH ROW
EXECUTE FUNCTION create_user_on_auth_insert();
