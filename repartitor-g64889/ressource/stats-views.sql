-- =============================================================================
-- Statistiques pour Repartitor
-- Fonctions paramétrées par un intervalle de temps [from_date, to_date]
-- =============================================================================

-- -----------------------------------------------------------------------------
-- stats_translator(from_date, to_date)
-- Renvoie une ligne par traducteur avec ses statistiques de productivité
-- sur l'intervalle donné.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION stats_translator(
  from_date timestamptz,
  to_date timestamptz
)
RETURNS TABLE (
  translator_id     bpchar,
  firstname         varchar,
  lastname          varchar,
  expectedthroughput int2,
  attributed_count  bigint,
  finished_count    bigint,
  in_progress_count bigint,
  late_count        bigint,
  total_words       bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    t.id AS translator_id,
    t.firstname,
    t.lastname,
    t.expectedthroughput,
    -- nombre de traductions attribuées dans la période
    COUNT(tr.text) FILTER (
      WHERE tr.attributed >= from_date AND tr.attributed <= to_date
    ) AS attributed_count,
    -- nombre de traductions finies dans la période
    COUNT(tr.text) FILTER (
      WHERE tr.finished IS NOT NULL
        AND tr.finished >= from_date
        AND tr.finished <= to_date
    ) AS finished_count,
    -- nombre de traductions en cours (attribuées avant la fin de période, pas finies)
    COUNT(tr.text) FILTER (
      WHERE tr.attributed <= to_date
        AND (tr.finished IS NULL OR tr.finished > to_date)
    ) AS in_progress_count,
    -- nombre de traductions finies en retard (sur la période)
    COUNT(tr.text) FILTER (
      WHERE tr.finished IS NOT NULL
        AND tr.finished > tr.deadline
        AND tr.finished >= from_date
        AND tr.finished <= to_date
    ) AS late_count,
    -- total des mots traduits dans la période (textes finis dans la période)
    COALESCE(SUM(tx.wordcount) FILTER (
      WHERE tr.finished IS NOT NULL
        AND tr.finished >= from_date
        AND tr.finished <= to_date
    ), 0)::bigint AS total_words
  FROM translator t
  LEFT JOIN translation tr ON tr.translator = t.id
  LEFT JOIN text tx ON tx.id = tr.text
  GROUP BY t.id, t.firstname, t.lastname, t.expectedthroughput
  ORDER BY t.id;
$$;

-- -----------------------------------------------------------------------------
-- stats_editor(from_date, to_date)
-- Idem mais pour les éditeurs.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION stats_editor(
  from_date timestamptz,
  to_date timestamptz
)
RETURNS TABLE (
  editor_id         bpchar,
  firstname         varchar,
  lastname          varchar,
  attributed_count  bigint,
  finished_count    bigint,
  in_progress_count bigint,
  late_count        bigint,
  total_words       bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    e.id AS editor_id,
    e.firstname,
    e.lastname,
    COUNT(ed.text) FILTER (
      WHERE ed.attributed >= from_date AND ed.attributed <= to_date
    ) AS attributed_count,
    COUNT(ed.text) FILTER (
      WHERE ed.finished IS NOT NULL
        AND ed.finished >= from_date
        AND ed.finished <= to_date
    ) AS finished_count,
    COUNT(ed.text) FILTER (
      WHERE ed.attributed <= to_date
        AND (ed.finished IS NULL OR ed.finished > to_date)
    ) AS in_progress_count,
    -- pour l'éditeur, le retard est mesuré par rapport à la deadline du TEXTE
    -- (pas de deadline propre à edition dans la table)
    COUNT(ed.text) FILTER (
      WHERE ed.finished IS NOT NULL
        AND ed.finished > tx.deadline
        AND ed.finished >= from_date
        AND ed.finished <= to_date
    ) AS late_count,
    COALESCE(SUM(tx.wordcount) FILTER (
      WHERE ed.finished IS NOT NULL
        AND ed.finished >= from_date
        AND ed.finished <= to_date
    ), 0)::bigint AS total_words
  FROM editor e
  LEFT JOIN edition ed ON ed.editor = e.id
  LEFT JOIN text tx ON tx.id = ed.text
  GROUP BY e.id, e.firstname, e.lastname
  ORDER BY e.id;
$$;

-- -----------------------------------------------------------------------------
-- stats_global(from_date, to_date)
-- Stats globales du service : une seule ligne.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION stats_global(
  from_date timestamptz,
  to_date timestamptz
)
RETURNS TABLE (
  total_texts             bigint,
  translations_finished   bigint,
  translations_in_progress bigint,
  translations_late       bigint,
  editions_finished       bigint,
  editions_in_progress    bigint,
  editions_late           bigint,
  active_translators      bigint,
  active_editors          bigint,
  total_words_translated  bigint,
  total_words_edited      bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    (SELECT COUNT(*) FROM text WHERE received <= to_date)::bigint AS total_texts,

    -- traductions
    (SELECT COUNT(*) FROM translation
      WHERE finished IS NOT NULL
        AND finished >= from_date AND finished <= to_date)::bigint
      AS translations_finished,
    (SELECT COUNT(*) FROM translation
      WHERE attributed <= to_date
        AND (finished IS NULL OR finished > to_date))::bigint
      AS translations_in_progress,
    (SELECT COUNT(*) FROM translation
      WHERE finished IS NOT NULL
        AND finished > deadline
        AND finished >= from_date AND finished <= to_date)::bigint
      AS translations_late,

    -- éditions (retard mesuré sur deadline du texte)
    (SELECT COUNT(*) FROM edition
      WHERE finished IS NOT NULL
        AND finished >= from_date AND finished <= to_date)::bigint
      AS editions_finished,
    (SELECT COUNT(*) FROM edition
      WHERE attributed <= to_date
        AND (finished IS NULL OR finished > to_date))::bigint
      AS editions_in_progress,
    (SELECT COUNT(*) FROM edition ed
      JOIN text tx ON tx.id = ed.text
      WHERE ed.finished IS NOT NULL
        AND ed.finished > tx.deadline
        AND ed.finished >= from_date AND ed.finished <= to_date)::bigint
      AS editions_late,

    -- nombre de traducteurs/éditeurs ayant au moins une attribution active dans la période
    (SELECT COUNT(DISTINCT translator) FROM translation
      WHERE attributed <= to_date
        AND (finished IS NULL OR finished >= from_date))::bigint
      AS active_translators,
    (SELECT COUNT(DISTINCT editor) FROM edition
      WHERE attributed <= to_date
        AND (finished IS NULL OR finished >= from_date))::bigint
      AS active_editors,

    -- volumes
    (SELECT COALESCE(SUM(tx.wordcount), 0) FROM translation tr
      JOIN text tx ON tx.id = tr.text
      WHERE tr.finished IS NOT NULL
        AND tr.finished >= from_date AND tr.finished <= to_date)::bigint
      AS total_words_translated,
    (SELECT COALESCE(SUM(tx.wordcount), 0) FROM edition ed
      JOIN text tx ON tx.id = ed.text
      WHERE ed.finished IS NOT NULL
        AND ed.finished >= from_date AND ed.finished <= to_date)::bigint
      AS total_words_edited;
$$;