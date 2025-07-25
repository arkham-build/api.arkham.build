SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: arkhamdb_decklists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arkhamdb_decklists (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    date_creation timestamp without time zone NOT NULL,
    date_update timestamp without time zone,
    description_md text,
    user_id integer NOT NULL,
    investigator_code character varying(36) NOT NULL,
    investigator_name character varying(255) NOT NULL,
    slots jsonb NOT NULL,
    side_slots jsonb,
    ignore_deck_limit_slots jsonb,
    version character varying(8),
    xp integer,
    xp_spent integer,
    xp_adjustment integer,
    exile_string text,
    taboo_id integer,
    meta jsonb,
    tags text,
    previous_deck integer,
    next_deck integer,
    canonical_investigator_code character varying(73) NOT NULL,
    like_count integer DEFAULT 0 NOT NULL
);


--
-- Name: arkhamdb_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arkhamdb_users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    reputation integer DEFAULT 0 NOT NULL
);


--
-- Name: cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cards (
    alt_art_investigator boolean DEFAULT false,
    alternate_of_code character varying(36),
    back_illustrator character varying(255),
    back_link_id character varying(36),
    clues integer,
    clues_fixed boolean DEFAULT false,
    code character varying(36) NOT NULL,
    cost integer,
    customization_options jsonb,
    deck_limit integer,
    deck_options jsonb,
    deck_requirements jsonb,
    doom integer,
    double_sided boolean DEFAULT false,
    duplicate_of_code character varying(36),
    encounter_code character varying(255),
    encounter_position integer,
    enemy_damage integer,
    enemy_evade integer,
    enemy_fight integer,
    enemy_horror integer,
    errata_date date,
    exceptional boolean DEFAULT false,
    exile boolean DEFAULT false,
    faction_code character varying(36) NOT NULL,
    faction2_code character varying(36),
    faction3_code character varying(36),
    heals_damage boolean DEFAULT false,
    heals_horror boolean DEFAULT false,
    health integer,
    health_per_investigator boolean DEFAULT false,
    hidden boolean DEFAULT false,
    id character varying(40) NOT NULL,
    illustrator character varying(255),
    is_unique boolean DEFAULT false,
    linked boolean DEFAULT false,
    myriad boolean DEFAULT false,
    official boolean DEFAULT true NOT NULL,
    pack_code character varying(36) NOT NULL,
    pack_position integer,
    permanent boolean DEFAULT false,
    "position" integer NOT NULL,
    preview boolean DEFAULT false,
    quantity integer NOT NULL,
    real_back_flavor text,
    real_back_name character varying(255),
    real_back_text text,
    real_back_traits character varying(255),
    real_customization_change text,
    real_customization_text text,
    real_flavor text,
    real_name character varying(255) NOT NULL,
    real_slot character varying(36),
    real_subname character varying(255),
    real_taboo_text_change text,
    real_text text,
    real_traits character varying(255),
    restrictions jsonb,
    sanity integer,
    shroud integer,
    side_deck_options jsonb,
    side_deck_requirements jsonb,
    skill_agility integer,
    skill_combat integer,
    skill_intellect integer,
    skill_wild integer,
    skill_willpower integer,
    stage integer,
    subtype_code character varying(36),
    taboo_set_id integer,
    taboo_xp integer,
    tags jsonb,
    translations jsonb,
    type_code character varying(36) NOT NULL,
    vengeance integer,
    victory integer,
    xp integer
);


--
-- Name: cycles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cycles (
    code character varying(36) NOT NULL,
    "position" integer NOT NULL,
    real_name character varying(255) NOT NULL,
    translations jsonb NOT NULL
);


--
-- Name: data_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_versions (
    card_count integer NOT NULL,
    cards_updated_at timestamp without time zone NOT NULL,
    locale character varying(10) NOT NULL,
    translation_updated_at timestamp without time zone NOT NULL
);


--
-- Name: encounter_sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encounter_sets (
    code character varying(255) NOT NULL,
    pack_code character varying(36) NOT NULL,
    real_name character varying(255) NOT NULL,
    translations jsonb NOT NULL
);


--
-- Name: factions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factions (
    code character varying(36) NOT NULL,
    is_primary boolean NOT NULL,
    name character varying(255) NOT NULL
);


--
-- Name: packs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.packs (
    code character varying(36) NOT NULL,
    cycle_code character varying(36) NOT NULL,
    "position" integer NOT NULL,
    real_name character varying(255) NOT NULL,
    translations jsonb NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: subtypes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtypes (
    code character varying(36) NOT NULL,
    name character varying(255) NOT NULL
);


--
-- Name: taboo_sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taboo_sets (
    card_count integer NOT NULL,
    id integer NOT NULL,
    date date NOT NULL,
    name character varying(255)
);


--
-- Name: types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.types (
    code character varying(36) NOT NULL,
    name character varying(255) NOT NULL
);


--
-- Name: arkhamdb_decklists arkhamdb_decklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklists
    ADD CONSTRAINT arkhamdb_decklists_pkey PRIMARY KEY (id);


--
-- Name: arkhamdb_users arkhamdb_users_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_users
    ADD CONSTRAINT arkhamdb_users_name_key UNIQUE (name);


--
-- Name: arkhamdb_users arkhamdb_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_users
    ADD CONSTRAINT arkhamdb_users_pkey PRIMARY KEY (id);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: cycles cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cycles
    ADD CONSTRAINT cycles_pkey PRIMARY KEY (code);


--
-- Name: data_versions data_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_versions
    ADD CONSTRAINT data_versions_pkey PRIMARY KEY (locale);


--
-- Name: encounter_sets encounter_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter_sets
    ADD CONSTRAINT encounter_sets_pkey PRIMARY KEY (code);


--
-- Name: factions factions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factions
    ADD CONSTRAINT factions_pkey PRIMARY KEY (code);


--
-- Name: packs packs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packs
    ADD CONSTRAINT packs_pkey PRIMARY KEY (code);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: subtypes subtypes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtypes
    ADD CONSTRAINT subtypes_pkey PRIMARY KEY (code);


--
-- Name: taboo_sets taboo_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taboo_sets
    ADD CONSTRAINT taboo_sets_pkey PRIMARY KEY (id);


--
-- Name: types types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.types
    ADD CONSTRAINT types_pkey PRIMARY KEY (code);


--
-- Name: idx_arkhamdb_decklists_canonical_investigator_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklists_canonical_investigator_code ON public.arkhamdb_decklists USING btree (canonical_investigator_code);


--
-- Name: idx_arkhamdb_decklists_side_slots; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklists_side_slots ON public.arkhamdb_decklists USING gin (side_slots);


--
-- Name: idx_arkhamdb_decklists_slots; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklists_slots ON public.arkhamdb_decklists USING gin (slots);


--
-- Name: idx_arkhamdb_decklists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklists_user_id ON public.arkhamdb_decklists USING btree (user_id);


--
-- Name: idx_cards_alternate_of_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_alternate_of_code ON public.cards USING btree (alternate_of_code);


--
-- Name: idx_cards_duplicate_of_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_duplicate_of_code ON public.cards USING btree (duplicate_of_code);


--
-- Name: idx_cards_encounter_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_encounter_code ON public.cards USING btree (encounter_code);


--
-- Name: idx_cards_faction2_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_faction2_code ON public.cards USING btree (faction2_code);


--
-- Name: idx_cards_faction3_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_faction3_code ON public.cards USING btree (faction3_code);


--
-- Name: idx_cards_faction_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_faction_code ON public.cards USING btree (faction_code);


--
-- Name: idx_cards_pack_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_pack_code ON public.cards USING btree (pack_code);


--
-- Name: idx_cards_subtype_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_subtype_code ON public.cards USING btree (subtype_code);


--
-- Name: idx_cards_taboo_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_taboo_set_id ON public.cards USING btree (taboo_set_id);


--
-- Name: idx_cards_type_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cards_type_code ON public.cards USING btree (type_code);


--
-- Name: idx_encounter_sets_pack_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_encounter_sets_pack_code ON public.encounter_sets USING btree (pack_code);


--
-- Name: idx_packs_cycle_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_packs_cycle_code ON public.packs USING btree (cycle_code);


--
-- Name: arkhamdb_decklists arkhamdb_decklists_investigator_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklists
    ADD CONSTRAINT arkhamdb_decklists_investigator_code_fkey FOREIGN KEY (investigator_code) REFERENCES public.cards(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: arkhamdb_decklists arkhamdb_decklists_next_deck_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklists
    ADD CONSTRAINT arkhamdb_decklists_next_deck_fkey FOREIGN KEY (next_deck) REFERENCES public.arkhamdb_decklists(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: arkhamdb_decklists arkhamdb_decklists_previous_deck_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklists
    ADD CONSTRAINT arkhamdb_decklists_previous_deck_fkey FOREIGN KEY (previous_deck) REFERENCES public.arkhamdb_decklists(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: arkhamdb_decklists arkhamdb_decklists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklists
    ADD CONSTRAINT arkhamdb_decklists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.arkhamdb_users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: cards cards_alternate_of_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_alternate_of_code_fkey FOREIGN KEY (alternate_of_code) REFERENCES public.cards(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: cards cards_duplicate_of_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_duplicate_of_code_fkey FOREIGN KEY (duplicate_of_code) REFERENCES public.cards(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: cards cards_encounter_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_encounter_code_fkey FOREIGN KEY (encounter_code) REFERENCES public.encounter_sets(code) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: cards cards_faction2_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_faction2_code_fkey FOREIGN KEY (faction2_code) REFERENCES public.factions(code) ON DELETE SET NULL;


--
-- Name: cards cards_faction3_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_faction3_code_fkey FOREIGN KEY (faction3_code) REFERENCES public.factions(code) ON DELETE SET NULL;


--
-- Name: cards cards_faction_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_faction_code_fkey FOREIGN KEY (faction_code) REFERENCES public.factions(code);


--
-- Name: cards cards_pack_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pack_code_fkey FOREIGN KEY (pack_code) REFERENCES public.packs(code) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: cards cards_subtype_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_subtype_code_fkey FOREIGN KEY (subtype_code) REFERENCES public.subtypes(code) ON DELETE SET NULL;


--
-- Name: cards cards_taboo_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_taboo_set_id_fkey FOREIGN KEY (taboo_set_id) REFERENCES public.taboo_sets(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: cards cards_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_type_code_fkey FOREIGN KEY (type_code) REFERENCES public.types(code) ON DELETE CASCADE;


--
-- Name: encounter_sets encounter_sets_pack_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter_sets
    ADD CONSTRAINT encounter_sets_pack_code_fkey FOREIGN KEY (pack_code) REFERENCES public.packs(code);


--
-- Name: packs packs_cycle_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packs
    ADD CONSTRAINT packs_cycle_code_fkey FOREIGN KEY (cycle_code) REFERENCES public.cycles(code);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20250724212919'),
    ('20250725092618');
