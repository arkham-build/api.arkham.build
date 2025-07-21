.PHONY: up down build logs shell clean migrate-new migrate-dump

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

migrate-new:
	docker compose run --rm -it  migrate new $(NAME)

migrate-dump:
	docker compose run --rm -it migrate dump
