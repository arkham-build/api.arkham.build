-- migrate:up

CREATE INDEX idx_arkhamdb_user_reputation ON arkhamdb_user(reputation);
CREATE INDEX idx_arkhamdb_decklist_user_like_date ON arkhamdb_decklist(user_id, like_count, date_creation);

CREATE TABLE card_resolution(
  id VARCHAR(36) NOT NULL REFERENCES card(id),
  resolves_to VARCHAR(36) NOT NULL REFERENCES card(id),
  PRIMARY KEY (id, resolves_to)
);

CREATE INDEX idx_card_id ON card(id);
CREATE INDEX idx_card_resolution_id ON card_resolution(id);
CREATE INDEX idx_card_resolution_target ON card_resolution(resolves_to);

CREATE OR REPLACE FUNCTION resolve_card(input_id VARCHAR(36))
RETURNS VARCHAR(36) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT resolves_to FROM card_resolution WHERE id = input_id),
        input_id
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- migrate:down

DROP INDEX IF EXISTS idx_arkhamdb_user_reputation;
DROP INDEX IF EXISTS idx_arkhamdb_decklist_user_like_date;

DROP INDEX IF EXISTS idx_card_id;
DROP INDEX IF EXISTS idx_card_resolution_id;
DROP INDEX IF EXISTS idx_card_resolution_target;

DROP FUNCTION IF EXISTS resolve_card;

DROP TABLE IF EXISTS card_resolution;