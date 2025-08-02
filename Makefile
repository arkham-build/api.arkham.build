.PHONY: up down build logs shell clean migrate-new migrate-up migrate-down migrate-types ingest-metadata ingest-arkhamdb-decklists

up:
	COMPOSE_MENU=0 docker compose up --build

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
	docker compose run --build --rm -it migrate new $(NAME)

migrate-up:
	docker compose run --build --rm -it migrate up

migrate-down:
	docker compose run --build --rm -it migrate down

migrate-types:
	docker compose run --build --rm -it app npm run generate:database-types

ingest:
	docker compose run --build --rm -it app npm run ingest
