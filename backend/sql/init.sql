CREATE TABLE channels (
	id SERIAL PRIMARY KEY,
	channel_name TEXT UNIQUE,
	creation_date TIMESTAMPTZ DEFAULT NOW(),
	description TEXT
);

CREATE TABLE users (
	id SERIAL PRIMARY KEY,	
	email TEXT UNIQUE,
	image_path TEXT UNIQUE,
	join_date TIMESTAMPTZ DEFAULT NOW(),
	user_name TEXT UNIQUE,
	user_password TEXT
);

CREATE TABLE messages (
	id SERIAL PRIMARY KEY,
	user_name TEXT REFERENCES users(user_name) ON UPDATE CASCADE ON DELETE CASCADE,
	channel_name TEXT REFERENCES channels(channel_name) ON UPDATE CASCADE ON DELETE CASCADE,
	message TEXT,
	post_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE images (
	id SERIAL PRIMARY KEY,
	message_id INTEGER REFERENCES messages(id),
	height INTEGER,
	path TEXT UNIQUE,
	size INTEGER,
	width INTEGER
);


CREATE INDEX idx_message_user_name ON messages(user_name);

CREATE INDEX idx_message_channel_name ON messages(channel_name);

CREATE OR REPLACE FUNCTION delete_server_image() RETURNS TRIGGER AS $$
DECLARE 
    payload jsonb; 
BEGIN
    payload := row_to_json(OLD);

    PERFORM pg_notify('events', payload::text);

    RETURN NULL;
END; $$
LANGUAGE PLPGSQL; 

CREATE TRIGGER image_deleted
AFTER DELETE ON images
FOR EACH ROW
EXECUTE PROCEDURE delete_server_image();