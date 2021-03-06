SET TIMEZONE='America/Los_angeles';

-- Tables
CREATE TABLE users (
	id SERIAL PRIMARY KEY,	
	email TEXT UNIQUE NOT NULL,
	image_path TEXT NOT NULL,
	join_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	user_name TEXT UNIQUE NOT NULL,
	user_password TEXT NOT NULL,
	refresh_token TEXT
);

CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    channel_name TEXT UNIQUE NOT NULL,
    creation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT DEFAULT '',
    channel_owner TEXT DEFAULT 'admin' REFERENCES users(user_name) ON UPDATE CASCADE ON DELETE SET DEFAULT 
);

CREATE TABLE messages (
	id SERIAL PRIMARY KEY,
	user_name TEXT REFERENCES users(user_name) ON UPDATE CASCADE,
	channel_name TEXT REFERENCES channels(channel_name) ON UPDATE CASCADE ON DELETE CASCADE,
	message TEXT NOT NULL CHECK (message !~ '^(|\s.*)$'), --do not allow empty or messages with only spaces
	post_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	edited BOOLEAN DEFAULT FALSE NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE images (
	id SERIAL PRIMARY KEY,
	message_id INTEGER REFERENCES messages(id),
	height INTEGER,
	path TEXT UNIQUE NOT NULL,
	size INTEGER,
	width INTEGER
);

-- Indexes
CREATE INDEX idx_message_user_name ON messages(user_name);
CREATE INDEX idx_message_channel_name ON messages(channel_name);

--Triggers
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

INSERT INTO users(email, image_path, user_name, user_password)
VALUES ('admin@alexxbull.com', 'attachments/default/user-icon.svg', 'admin', current_setting('custom.admin_password'));

INSERT INTO channels(channel_name, description, channel_owner)
VALUES ('general', 'A channel for dicussing a range of topics', 'admin');