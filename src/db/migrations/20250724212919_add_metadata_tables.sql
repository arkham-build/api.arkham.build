-- migrate:up

CREATE TABLE factions(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  is_primary BOOLEAN NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE subtypes(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE types(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE data_versions(
  card_count INT NOT NULL,
  cards_updated_at TIMESTAMP NOT NULL,
  locale VARCHAR(10) NOT NULL PRIMARY KEY,
  translation_updated_at TIMESTAMP NOT NULL
);

CREATE TABLE cycles(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  position INT NOT NULL,
  real_name VARCHAR(255) NOT NULL,
  translations JSONB NOT NULL
);

CREATE TABLE packs(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  cycle_code VARCHAR(36) NOT NULL REFERENCES cycles(code),
  position INT NOT NULL,
  real_name VARCHAR(255) NOT NULL,
  translations JSONB NOT NULL
);


CREATE TABLE encounter_sets(
  code VARCHAR(255) NOT NULL PRIMARY KEY,
  pack_code VARCHAR(36) NOT NULL REFERENCES packs(code),
  real_name VARCHAR(255) NOT NULL,
  translations JSONB NOT NULL
);

CREATE TABLE taboo_sets(
  card_count INT NOT NULL,
  id INT NOT NULL PRIMARY KEY,
  date DATE NOT NULL,
  name VARCHAR(255)
);

CREATE TABLE cards(
  alt_art_investigator BOOLEAN DEFAULT FALSE,
  alternate_of_code VARCHAR(36) REFERENCES cards(id) DEFERRABLE INITIALLY DEFERRED,
  back_illustrator VARCHAR(255),
  back_link_id VARCHAR(36),
  clues INT,
  clues_fixed BOOLEAN DEFAULT FALSE,
  code VARCHAR(36) NOT NULL,
  cost INT,
  customization_options JSONB,
  deck_limit INT,
  deck_options JSONB,
  deck_requirements JSONB,
  doom INT,
  double_sided BOOLEAN DEFAULT FALSE,
  duplicate_of_code VARCHAR(36) REFERENCES cards(id) DEFERRABLE INITIALLY DEFERRED,
  encounter_code VARCHAR(255) REFERENCES encounter_sets(code) DEFERRABLE INITIALLY DEFERRED,
  encounter_position INT,
  enemy_damage INT,
  enemy_evade INT,
  enemy_fight INT,
  enemy_horror INT,
  errata_date DATE,
  exceptional BOOLEAN DEFAULT FALSE,
  exile BOOLEAN DEFAULT FALSE,
  faction_code VARCHAR(36) NOT NULL REFERENCES factions(code),
  faction2_code VARCHAR(36) REFERENCES factions(code) ON DELETE SET NULL,
  faction3_code VARCHAR(36) REFERENCES factions(code) ON DELETE SET NULL,
  heals_damage BOOLEAN DEFAULT FALSE,
  heals_horror BOOLEAN DEFAULT FALSE,
  health INT,
  health_per_investigator BOOLEAN DEFAULT FALSE,
  hidden BOOLEAN DEFAULT FALSE,
  id VARCHAR(40) NOT NULL PRIMARY KEY, -- UUID-{taboo}
  illustrator VARCHAR(255),
  is_unique BOOLEAN DEFAULT FALSE,
  linked BOOLEAN DEFAULT FALSE,
  myriad BOOLEAN DEFAULT FALSE,
  official BOOLEAN NOT NULL DEFAULT TRUE,
  pack_code VARCHAR(36) NOT NULL REFERENCES packs(code) DEFERRABLE INITIALLY DEFERRED,
  pack_position INT,
  permanent BOOLEAN DEFAULT FALSE,
  position INT NOT NULL,
  preview BOOLEAN DEFAULT FALSE,
  quantity INT NOT NULL,
  real_back_flavor TEXT,
  real_back_name VARCHAR(255),
  real_back_text TEXT,
  real_back_traits VARCHAR(255),
  real_customization_change TEXT,
  real_customization_text TEXT,
  real_flavor TEXT,
  real_name VARCHAR(255) NOT NULL,
  real_slot VARCHAR(36),
  real_subname VARCHAR(255),
  real_taboo_text_change TEXT,
  real_text TEXT,
  real_traits VARCHAR(255),
  restrictions JSONB,
  sanity INT,
  shroud INT,
  side_deck_options JSONB,
  side_deck_requirements JSONB,
  skill_agility INT,
  skill_combat INT,
  skill_intellect INT,
  skill_wild INT,
  skill_willpower INT,
  stage INT,
  subtype_code VARCHAR(36) REFERENCES subtypes(code) ON DELETE SET NULL,
  taboo_set_id INT REFERENCES taboo_sets(id) DEFERRABLE INITIALLY DEFERRED,
  taboo_xp INT,
  tags JSONB,
  translations JSONB,
  type_code VARCHAR(36) NOT NULL REFERENCES types(code) ON DELETE CASCADE,
  vengeance INT,
  victory INT,
  xp INT
);

CREATE INDEX idx_cards_alternate_of_code ON cards(alternate_of_code);
CREATE INDEX idx_cards_duplicate_of_code ON cards(duplicate_of_code);
CREATE INDEX idx_cards_encounter_code ON cards(encounter_code);
CREATE INDEX idx_cards_faction_code ON cards(faction_code);
CREATE INDEX idx_cards_faction2_code ON cards(faction2_code);
CREATE INDEX idx_cards_faction3_code ON cards(faction3_code);
CREATE INDEX idx_cards_pack_code ON cards(pack_code);
CREATE INDEX idx_cards_subtype_code ON cards(subtype_code);
CREATE INDEX idx_cards_type_code ON cards(type_code);
CREATE INDEX idx_cards_taboo_set_id ON cards(taboo_set_id);
CREATE INDEX idx_encounter_sets_pack_code ON encounter_sets(pack_code);
CREATE INDEX idx_packs_cycle_code ON packs(cycle_code);

-- migrate:down

DROP TABLE cards;
DROP TABLE cycles;
DROP TABLE data_versions;
DROP TABLE encounter_sets;
DROP TABLE factions;
DROP TABLE packs;
DROP TABLE subtypes;
DROP TABLE taboo_sets;
DROP TABLE types;

DROP INDEX idx_cards_alternate_of_code;
DROP INDEX idx_cards_duplicate_of_code;
DROP INDEX idx_cards_encounter_code;
DROP INDEX idx_cards_faction_code;
DROP INDEX idx_cards_faction2_code;
DROP INDEX idx_cards_faction3_code;
DROP INDEX idx_cards_pack_code;
DROP INDEX idx_cards_subtype_code;
DROP INDEX idx_cards_type_code;
DROP INDEX idx_cards_taboo_set_id;
DROP INDEX idx_encounter_sets_pack_code;
DROP INDEX idx_packs_cycle_code;
