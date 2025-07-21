.PHONY: up down build logs shell clean

up:
	COMPOSE_MENU=0 docker compose up

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

shell:
	docker compose exec app sh

clean:
	docker compose down -v --remove-orphans