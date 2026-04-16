include .env

SHELL := /bin/bash

POSTGRES_HOST ?= localhost
POSTGRES_DB ?= defaultdb
POSTGRES_USER ?= defaultuser
POSTGRES_PASSWORD ?= defaultpassword
RPCHAT_MODERATOR_PASSWORD ?= defaultmoderatorpassword
RPCHAT_ENV ?= dev
RPCHAT_SERVER_HOST ?= localhost
PGOPTIONS ?= "-c custom.moderator_password=$(RPCHAT_MODERATOR_PASSWORD)"

all:
	@echo "Specify a command"

# Generate .env file needed to connect to database
.env:
	@echo "Generating .env"
	@echo "POSTGRES_DB=$(POSTGRES_DB)" > $@
	@echo "POSTGRES_USER=$(POSTGRES_USER)" >> $@
	@echo "POSTGRES_PASSWORD=$(POSTGRES_PASSWORD)" >> $@
	@echo "RPCHAT_MODERATOR_PASSWORD=$(RPCHAT_MODERATOR_PASSWORD)" >> $@
	@echo "RPCHAT_ENV=$(RPCHAT_ENV)" >> $@
	@echo "PGOPTIONS=\"$(PGOPTIONS)\"" >> $@

# Initialize database from a fresh start
db-init: .env
	@PGOPTIONS=$(PGOPTIONS) \
		psql -h "$(POSTGRES_HOST)" \
		-d postgres \
		-f ./sql/init.sql \
	  	-v user="$(POSTGRES_USER)" \
	  	-v pass="$(POSTGRES_PASSWORD)" \
	  	-v db="$(POSTGRES_DB)"

# Reset database to a fresh start
db-reset:
	@# Remove connected users
	@PGOPTIONS=$(PGOPTIONS) psql -h "$(POSTGRES_HOST)" -d postgres -c "REVOKE CONNECT ON DATABASE $(POSTGRES_DB) FROM public;"
	@PGOPTIONS=$(PGOPTIONS) psql -h "$(POSTGRES_HOST)" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$(POSTGRES_DB)';"
	
	@# Delete the default database and user
	@PGOPTIONS=$(PGOPTIONS) psql -h "$(POSTGRES_HOST)" -d postgres -c "DROP DATABASE IF EXISTS $(POSTGRES_DB);"
	@PGOPTIONS=$(PGOPTIONS) psql -h "$(POSTGRES_HOST)" -d postgres -c "DROP USER IF EXISTS $(POSTGRES_USER);"


# Generate certs for running server locally
cert.pem key.pem:
	@openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

./rpchat-server:
	@go build -o rpchat-server

server-local-deps: cert.pem key.pem .env

# Start server
server-start-local: server-local-deps ./rpchat-server
	@source .env && ./rpchat-server

# Start server with hot reloading
server-start-dev: server-local-deps
	@go get -tool github.com/air-verse/air@latest
	@source .env && go tool air