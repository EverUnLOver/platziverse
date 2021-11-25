#! psql postgres

CREATE ROLE platzi WITH LOGIN PASSWORD 'platzi';
CREATE DATABASE plaziverse;
GRANT ALL PRIVILEGES ON DATABASE plaziverse TO platzi;
\quit