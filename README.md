# api.arkham.build

Node.js backend for [arkham.build](https://arkham.build). At the moment, it provides card recommendations based on aggregating ArkhamDB deck guides.

## Overview

The app is a HTTP API written in [Typescript](https://www.typescriptlang.org/). It uses the [Hono](https://hono.dev/) framework and validates requests with [zod](https://zod.dev/).

Data is ingested from several upstream sources with a daily cron job, stored in a [Postgres](https://www.postgresql.org/) database and accessed via [kysely](https://kysely.dev/). Migrations are handled with [dbmate](https://github.com/amacneil/dbmate).

Integration tests are written in [Vitest](https://vitest.dev/) and use [Testcontainers](https://testcontainers.com/) to work against a real database.

The app is deployed to a [Digital Ocean](https://www.digitalocean.com/) droplet, managed with [Kamal](https://kamal-deploy.org/).

## Acknowledgements

The original recommendation logic was contributed by [Sy Brand / TartanLlama](https://github.com/TartanLlama) in a [separate project](https://github.com/TartanLlama/arkham-rec-provider/) and has since been ported over.

## Develop

```sh
# install tooling dependencies
npm install

# start docker compose
make up

# (separate shell) run migrations
make migrate-up

# (separate shell) ingest data
make ingest

# more commands are available in Makefile
```

```sh
# run tests
npm test

# auto-format code
npm run fmt

# lint code
npm run lint

# check types
npm run check
```

You can find a pre-configured [Yaak](https://yaak.app/) workspace in `./config/yaak`.

## Deploy

Refer to available [Kamal commands](https://kamal-deploy.org/docs/commands/view-all-commands/) and the additional `aliases` in the `deploy.yml` file.
