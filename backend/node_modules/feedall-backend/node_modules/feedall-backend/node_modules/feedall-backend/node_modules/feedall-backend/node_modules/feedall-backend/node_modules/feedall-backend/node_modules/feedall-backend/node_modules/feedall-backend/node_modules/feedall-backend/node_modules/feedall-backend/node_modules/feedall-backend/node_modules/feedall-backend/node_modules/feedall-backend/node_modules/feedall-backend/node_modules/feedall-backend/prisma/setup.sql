-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'feeduser') THEN
      CREATE USER feeduser WITH PASSWORD '%1nt3rfac3@';
   END IF;
END
$do$;

-- Create database if not exists
SELECT 'CREATE DATABASE feedall'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'feedall')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE feedall TO feeduser;
ALTER DATABASE feedall OWNER TO feeduser;

-- Connect to the feedall database and set up schema permissions
\c feedall

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO feeduser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO feeduser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO feeduser;
