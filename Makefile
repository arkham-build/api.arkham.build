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

migration-create:
	docker compose run --rm -it migrate new $(NAME)

migration-dump-schema:
	docker compose run --rm -it migrate dump

ingest-metadata:
	docker compose run --rm -it app npm run ingest:metadata

ingest-arkhamdb-decklists:
	docker compose run --rm -it app npm run ingest:arkhamdb-decklists