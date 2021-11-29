#! psql postgres

CREATE ROLE platzi WITH LOGIN PASSWORD 'platzi';
ALTER ROLE platzi WITH superuser;
DROP ROLE IF EXISTS platzi;
CREATE USER platzi WITH ROLE 'platzi';
CREATE DATABASE plaziverse;
GRANT ALL PRIVILEGES ON DATABASE plaziverse TO platzi;
ALTER DATABASE plaziverse OWNER TO platzi;
\du
\quit
select * from agents;
