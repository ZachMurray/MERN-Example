# Makefile for MERN Stack

.PHONY: help build up down logs logs-backend logs-frontend logs-db restart clean reset shell

help:
	@echo "MERN Stack - Docker Commands"
	@echo "=============================="
	@echo ""
	@echo "make up              - Start all services"
	@echo "make build           - Build and start all services"
	@echo "make down            - Stop all services"
	@echo "make restart         - Restart all services"
	@echo "make logs            - View all logs"
	@echo "make logs-backend    - View backend logs"
	@echo "make logs-frontend   - View frontend logs"
	@echo "make logs-db         - View database logs"
	@echo "make clean           - Stop and remove containers"
	@echo "make reset           - Stop, remove containers and volumes (deletes database)"
	@echo "make shell-backend   - Open shell in backend container"
	@echo "make shell-frontend  - Open shell in frontend container"

build:
	docker-compose up --build -d

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f mongodb

clean:
	docker-compose down

reset:
	docker-compose down -v

shell-backend:
	docker-compose exec backend sh

shell-frontend:
	docker-compose exec frontend sh

.DEFAULT_GOAL := help
