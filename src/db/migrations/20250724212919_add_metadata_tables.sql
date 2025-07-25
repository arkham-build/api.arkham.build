-- migrate:up

CREATE TABLE faction(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  is_primary BOOLEAN NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE subtype(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE type(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE data_version(
  card_count INT NOT NULL,
  cards_updated_at TIMESTAMP NOT NULL,
  locale VARCHAR(10) NOT NULL PRIMARY KEY,
  translation_updated_at TIMESTAMP NOT NULL
);

CREATE TABLE cycle(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  position INT NOT NULL,
  real_name VARCHAR(255) NOT NULL,
  translations JSONB NOT NULL
);

CREATE TABLE pack(
  code VARCHAR(36) NOT NULL PRIMARY KEY,
  cycle_code VARCHAR(36) NOT NULL REFERENCES cycle(code),
  position INT NOT NULL,
  real_name VARCHAR(255) NOT NULL,
  translations JSONB NOT NULL
);


CREATE TABLE encounter_set(
  code VARCHAR(255) NOT NULL PRIMARY KEY,
  pack_code VARCHAR(36) NOT NULL REFERENCES pack(code),
  real_name VARCHAR(255) NOT NULL,
  translations JSONB NOT NULL
);

CREATE TABLE taboo_set(
  card_count INT NOT NULL,
  id INT NOT NULL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  name VARCHAR(255)
);

CREATE TABLE card(
  alt_art_investigator BOOLEAN DEFAULT FALSE,
  alternate_of_code VARCHAR(36) REFERENCES card(id) DEFERRABLE INITIALLY DEFERRED,
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
  duplicate_of_code VARCHAR(36) REFERENCES card(id) DEFERRABLE INITIALLY DEFERRED,
  encounter_code VARCHAR(255) REFERENCES encounter_set(code),
  encounter_position INT,
  enemy_damage INT,
  enemy_evade INT,
  enemy_fight INT,
  enemy_horror INT,
  errata_date TIMESTAMP,
  exceptional BOOLEAN DEFAULT FALSE,
  exile BOOLEAN DEFAULT FALSE,
  faction_code VARCHAR(36) NOT NULL REFERENCES faction(code),
  faction2_code VARCHAR(36) REFERENCES faction(code) ON DELETE SET NULL,
  faction3_code VARCHAR(36) REFERENCES faction(code) ON DELETE SET NULL,
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
  pack_code VARCHAR(36) NOT NULL REFERENCES pack(code),
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
  subtype_code VARCHAR(36) REFERENCES subtype(code) ON DELETE SET NULL,
  taboo_set_id INT REFERENCES taboo_set(id),
  taboo_xp INT,
  tags JSONB,
  translations JSONB,
  type_code VARCHAR(36) NOT NULL REFERENCES type(code) ON DELETE CASCADE,
  vengeance INT,
  victory INT,
  xp INT
);

CREATE INDEX idx_card_code ON card(code);
CREATE INDEX idx_card_alternate_of_code ON card(alternate_of_code);
CREATE INDEX idx_card_duplicate_of_code ON card(duplicate_of_code);
CREATE INDEX idx_card_encounter_code ON card(encounter_code);
CREATE INDEX idx_card_faction_code ON card(faction_code);
CREATE INDEX idx_card_faction2_code ON card(faction2_code);
CREATE INDEX idx_card_faction3_code ON card(faction3_code);
CREATE INDEX idx_card_pack_code ON card(pack_code);
CREATE INDEX idx_card_subtype_code ON card(subtype_code);
CREATE INDEX idx_card_type_code ON card(type_code);
CREATE INDEX idx_card_taboo_set_id ON card(taboo_set_id);
CREATE INDEX idx_encounter_set_pack_code ON encounter_set(pack_code);
CREATE INDEX idx_pack_cycle_code ON pack(cycle_code);

-- migrate:down
