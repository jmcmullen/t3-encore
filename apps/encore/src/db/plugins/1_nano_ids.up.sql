CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION nanoid(
    prefix text DEFAULT null,
    size int DEFAULT 21
)
RETURNS text AS $$
DECLARE
id text := '';
  i int := 0;
  urlAlphabet char(36) := '0123456789abcdefghijklmnopqrstuvwxyz';
  bytes bytea := gen_random_bytes(size);
  byte int;
  pos int;
BEGIN
  WHILE i < size LOOP
    byte := get_byte(bytes, i);
    pos := (byte & 35) + 1;
    id := id || substr(urlAlphabet, pos, 1);
    i = i + 1;
END LOOP;
IF prefix IS NULL THEN
    RETURN id;
ELSE
    RETURN CONCAT(LOWER(prefix), '_', id);
END IF;
END
$$ LANGUAGE PLPGSQL VOLATILE;