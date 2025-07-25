-- migrate:up

CREATE TABLE arkhamdb_users(
  id INTEGER PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  reputation INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE arkhamdb_decklists (
  id INTEGER PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  date_creation TIMESTAMP NOT NULL,
  date_update TIMESTAMP,
  description_md TEXT,
  user_id INTEGER NOT NULL REFERENCES arkhamdb_users(id) DEFERRABLE INITIALLY DEFERRED,
  investigator_code VARCHAR(36) NOT NULL REFERENCES cards(id) DEFERRABLE INITIALLY DEFERRED,
  investigator_name VARCHAR(255) NOT NULL,
  slots JSONB NOT NULL,
  side_slots JSONB,
  ignore_deck_limit_slots JSONB,
  version VARCHAR(8),
  xp INTEGER,
  xp_spent INTEGER,
  xp_adjustment INTEGER,
  exile_string TEXT,
  taboo_id INTEGER,
  meta JSONB,
  tags TEXT,
  previous_deck INTEGER REFERENCES arkhamdb_decklists(id) DEFERRABLE INITIALLY DEFERRED,
  next_deck INTEGER REFERENCES arkhamdb_decklists(id) DEFERRABLE INITIALLY DEFERRED,
  canonical_investigator_code VARCHAR(73) NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_arkhamdb_decklists_slots ON arkhamdb_decklists USING GIN (slots);
CREATE INDEX idx_arkhamdb_decklists_side_slots ON arkhamdb_decklists USING GIN (side_slots);
CREATE INDEX idx_arkhamdb_decklists_canonical_investigator_code ON arkhamdb_decklists(canonical_investigator_code);
CREATE INDEX idx_arkhamdb_decklists_user_id ON arkhamdb_decklists(user_id);

-- migrate:down

DROP TABLE IF EXISTS arkhamdb_decklists;
DROP TABLE IF EXISTS arkhamdb_users;

DROP INDEX idx_arkhamdb_decklists_canonical_investigator_code;
DROP INDEX idx_arkhamdb_decklists_user_id;
DROP INDEX idx_arkhamdb_decklists_slots;
DROP INDEX idx_arkhamdb_decklists_side_slots;