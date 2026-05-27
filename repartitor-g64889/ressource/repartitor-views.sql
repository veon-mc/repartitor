-- View to be able to use the GROUP BY keyword.
CREATE VIEW public.translator_workload WITH (security_invoker = true) AS
  SELECT translator, SUM(wordcount) AS words, CAST(SUM(wordcount) AS float)/expectedthroughput AS busydays, COUNT(*) AS texts
    FROM translator
      LEFT JOIN translation ON translator.id = translation.translator
      JOIN text ON text.id =  translation.text
    WHERE finished IS NULL
    GROUP BY translator,expectedthroughput;

-- Function so that prec can be followed by supabase as a foreign key without ambiguity
CREATE OR REPLACE FUNCTION prec(public.text) returns setof public.text ROWS 1 AS $$
  SELECT * FROM text WHERE id = $1.precedent
$$ stable language sql;
