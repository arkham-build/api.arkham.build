-- migrate:up

CREATE TABLE arkhamdb_user (
  id INTEGER PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  reputation INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE arkhamdb_decklist (
  id INTEGER PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  date_creation TIMESTAMP NOT NULL,
  date_update TIMESTAMP,
  description_md TEXT,
  user_id INTEGER NOT NULL REFERENCES arkhamdb_user(id),
  investigator_code VARCHAR(36) NOT NULL,
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
  previous_deck INTEGER REFERENCES arkhamdb_decklist(id) DEFERRABLE INITIALLY DEFERRED,
  next_deck INTEGER REFERENCES arkhamdb_decklist(id) DEFERRABLE INITIALLY DEFERRED,
  canonical_investigator_code VARCHAR(73) NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE arkhamdb_decklist_duplicate (
  id INTEGER NOT NULL REFERENCES arkhamdb_decklist(id),
  duplicate_of INTEGER NOT NULL REFERENCES arkhamdb_decklist(id),
  PRIMARY KEY (id, duplicate_of)
);

CREATE INDEX idx_arkhamdb_decklist_canonical_investigator_code ON arkhamdb_decklist(canonical_investigator_code);
CREATE INDEX idx_arkhamdb_decklist_date_creation ON arkhamdb_decklist (date_creation);
CREATE INDEX idx_arkhamdb_decklist_id ON arkhamdb_decklist(id);
CREATE INDEX idx_arkhamdb_decklist_investigator_code ON arkhamdb_decklist(investigator_code);
CREATE INDEX idx_arkhamdb_decklist_side_slots ON arkhamdb_decklist USING GIN (side_slots);
CREATE INDEX idx_arkhamdb_decklist_slots ON arkhamdb_decklist USING GIN (slots);
CREATE INDEX idx_arkhamdb_decklist_user_id ON arkhamdb_decklist(user_id);
CREATE INDEX idx_duplicates_id ON arkhamdb_decklist_duplicate(id);

-- Recommendation indexes
CREATE INDEX idx_arkhamdb_decklist_filter
  ON arkhamdb_decklist (canonical_investigator_code)
  WHERE (like_count > 0) OR ((next_deck IS NULL) AND (previous_deck IS NULL));

-- migrate:down