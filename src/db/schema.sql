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
-- Name: arkhamdb_decklist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arkhamdb_decklist (
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
-- Name: arkhamdb_decklist_duplicate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arkhamdb_decklist_duplicate (
    id integer NOT NULL,
    duplicate_of integer NOT NULL
);


--
-- Name: arkhamdb_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arkhamdb_user (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    reputation integer DEFAULT 0 NOT NULL
);


--
-- Name: card; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card (
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
    errata_date timestamp without time zone,
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
-- Name: cycle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cycle (
    code character varying(36) NOT NULL,
    "position" integer NOT NULL,
    real_name character varying(255) NOT NULL,
    translations jsonb NOT NULL
);


--
-- Name: data_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_version (
    card_count integer NOT NULL,
    cards_updated_at timestamp without time zone NOT NULL,
    locale character varying(10) NOT NULL,
    translation_updated_at timestamp without time zone NOT NULL
);


--
-- Name: encounter_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encounter_set (
    code character varying(255) NOT NULL,
    pack_code character varying(36) NOT NULL,
    real_name character varying(255) NOT NULL,
    translations jsonb NOT NULL
);


--
-- Name: faction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faction (
    code character varying(36) NOT NULL,
    is_primary boolean NOT NULL,
    name character varying(255) NOT NULL
);


--
-- Name: pack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pack (
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
-- Name: subtype; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtype (
    code character varying(36) NOT NULL,
    name character varying(255) NOT NULL
);


--
-- Name: taboo_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taboo_set (
    card_count integer NOT NULL,
    id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    name character varying(255)
);


--
-- Name: type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.type (
    code character varying(36) NOT NULL,
    name character varying(255) NOT NULL
);


--
-- Name: arkhamdb_decklist_duplicate arkhamdb_decklist_duplicate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklist_duplicate
    ADD CONSTRAINT arkhamdb_decklist_duplicate_pkey PRIMARY KEY (id, duplicate_of);


--
-- Name: arkhamdb_decklist arkhamdb_decklist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklist
    ADD CONSTRAINT arkhamdb_decklist_pkey PRIMARY KEY (id);


--
-- Name: arkhamdb_user arkhamdb_user_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_user
    ADD CONSTRAINT arkhamdb_user_name_key UNIQUE (name);


--
-- Name: arkhamdb_user arkhamdb_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_user
    ADD CONSTRAINT arkhamdb_user_pkey PRIMARY KEY (id);


--
-- Name: card card_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_pkey PRIMARY KEY (id);


--
-- Name: cycle cycle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cycle
    ADD CONSTRAINT cycle_pkey PRIMARY KEY (code);


--
-- Name: data_version data_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_version
    ADD CONSTRAINT data_version_pkey PRIMARY KEY (locale);


--
-- Name: encounter_set encounter_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter_set
    ADD CONSTRAINT encounter_set_pkey PRIMARY KEY (code);


--
-- Name: faction faction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faction
    ADD CONSTRAINT faction_pkey PRIMARY KEY (code);


--
-- Name: pack pack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pack
    ADD CONSTRAINT pack_pkey PRIMARY KEY (code);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: subtype subtype_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtype
    ADD CONSTRAINT subtype_pkey PRIMARY KEY (code);


--
-- Name: taboo_set taboo_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taboo_set
    ADD CONSTRAINT taboo_set_pkey PRIMARY KEY (id);


--
-- Name: type type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type
    ADD CONSTRAINT type_pkey PRIMARY KEY (code);


--
-- Name: idx_arkhamdb_decklist_canonical_investigator_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklist_canonical_investigator_code ON public.arkhamdb_decklist USING btree (canonical_investigator_code);


--
-- Name: idx_arkhamdb_decklist_date_creation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklist_date_creation ON public.arkhamdb_decklist USING btree (date_creation);


--
-- Name: idx_arkhamdb_decklist_filter; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklist_filter ON public.arkhamdb_decklist USING btree (canonical_investigator_code) WHERE ((like_count > 0) OR ((next_deck IS NULL) AND (previous_deck IS NULL)));


--
-- Name: idx_arkhamdb_decklist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklist_id ON public.arkhamdb_decklist USING btree (id);


--
-- Name: idx_arkhamdb_decklist_investigator_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklist_investigator_code ON public.arkhamdb_decklist USING btree (investigator_code);


--
-- Name: idx_arkhamdb_decklist_side_slots; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklist_side_slots ON public.arkhamdb_decklist USING gin (side_slots);


--
-- Name: idx_arkhamdb_decklist_slots; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklist_slots ON public.arkhamdb_decklist USING gin (slots);


--
-- Name: idx_arkhamdb_decklist_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arkhamdb_decklist_user_id ON public.arkhamdb_decklist USING btree (user_id);


--
-- Name: idx_card_alternate_of_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_alternate_of_code ON public.card USING btree (alternate_of_code);


--
-- Name: idx_card_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_code ON public.card USING btree (code);


--
-- Name: idx_card_duplicate_of_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_duplicate_of_code ON public.card USING btree (duplicate_of_code);


--
-- Name: idx_card_encounter_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_encounter_code ON public.card USING btree (encounter_code);


--
-- Name: idx_card_faction2_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_faction2_code ON public.card USING btree (faction2_code);


--
-- Name: idx_card_faction3_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_faction3_code ON public.card USING btree (faction3_code);


--
-- Name: idx_card_faction_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_faction_code ON public.card USING btree (faction_code);


--
-- Name: idx_card_pack_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_pack_code ON public.card USING btree (pack_code);


--
-- Name: idx_card_subtype_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_subtype_code ON public.card USING btree (subtype_code);


--
-- Name: idx_card_taboo_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_taboo_set_id ON public.card USING btree (taboo_set_id);


--
-- Name: idx_card_type_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_card_type_code ON public.card USING btree (type_code);


--
-- Name: idx_duplicates_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_duplicates_id ON public.arkhamdb_decklist_duplicate USING btree (id);


--
-- Name: idx_encounter_set_pack_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_encounter_set_pack_code ON public.encounter_set USING btree (pack_code);


--
-- Name: idx_pack_cycle_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pack_cycle_code ON public.pack USING btree (cycle_code);


--
-- Name: arkhamdb_decklist_duplicate arkhamdb_decklist_duplicate_duplicate_of_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklist_duplicate
    ADD CONSTRAINT arkhamdb_decklist_duplicate_duplicate_of_fkey FOREIGN KEY (duplicate_of) REFERENCES public.arkhamdb_decklist(id);


--
-- Name: arkhamdb_decklist_duplicate arkhamdb_decklist_duplicate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklist_duplicate
    ADD CONSTRAINT arkhamdb_decklist_duplicate_id_fkey FOREIGN KEY (id) REFERENCES public.arkhamdb_decklist(id);


--
-- Name: arkhamdb_decklist arkhamdb_decklist_next_deck_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklist
    ADD CONSTRAINT arkhamdb_decklist_next_deck_fkey FOREIGN KEY (next_deck) REFERENCES public.arkhamdb_decklist(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: arkhamdb_decklist arkhamdb_decklist_previous_deck_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklist
    ADD CONSTRAINT arkhamdb_decklist_previous_deck_fkey FOREIGN KEY (previous_deck) REFERENCES public.arkhamdb_decklist(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: arkhamdb_decklist arkhamdb_decklist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arkhamdb_decklist
    ADD CONSTRAINT arkhamdb_decklist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.arkhamdb_user(id);


--
-- Name: card card_alternate_of_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_alternate_of_code_fkey FOREIGN KEY (alternate_of_code) REFERENCES public.card(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: card card_duplicate_of_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_duplicate_of_code_fkey FOREIGN KEY (duplicate_of_code) REFERENCES public.card(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: card card_encounter_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_encounter_code_fkey FOREIGN KEY (encounter_code) REFERENCES public.encounter_set(code);


--
-- Name: card card_faction2_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_faction2_code_fkey FOREIGN KEY (faction2_code) REFERENCES public.faction(code) ON DELETE SET NULL;


--
-- Name: card card_faction3_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_faction3_code_fkey FOREIGN KEY (faction3_code) REFERENCES public.faction(code) ON DELETE SET NULL;


--
-- Name: card card_faction_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_faction_code_fkey FOREIGN KEY (faction_code) REFERENCES public.faction(code);


--
-- Name: card card_pack_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_pack_code_fkey FOREIGN KEY (pack_code) REFERENCES public.pack(code);


--
-- Name: card card_subtype_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_subtype_code_fkey FOREIGN KEY (subtype_code) REFERENCES public.subtype(code) ON DELETE SET NULL;


--
-- Name: card card_taboo_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_taboo_set_id_fkey FOREIGN KEY (taboo_set_id) REFERENCES public.taboo_set(id);


--
-- Name: card card_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_type_code_fkey FOREIGN KEY (type_code) REFERENCES public.type(code) ON DELETE CASCADE;


--
-- Name: encounter_set encounter_set_pack_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter_set
    ADD CONSTRAINT encounter_set_pack_code_fkey FOREIGN KEY (pack_code) REFERENCES public.pack(code);


--
-- Name: pack pack_cycle_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pack
    ADD CONSTRAINT pack_cycle_code_fkey FOREIGN KEY (cycle_code) REFERENCES public.cycle(code);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20250724212919'),
    ('20250725092618');
