import { supabase } from '@/lib/supabase'

/**
 * Récupère tous les textes depuis Supabase.
 * Utilisé par la vue répartiteur.
 * @returns {Promise<Array>} liste de textes
 */
export async function getAllTexts() {
  const { data, error } = await supabase
    .from('text')
    .select('id, cote, title, received, deadline, wordcount, precedent')
    .order('deadline', { ascending: true })

  if (error) {
    console.error('Erreur lors de la récupération des textes :', error)
    throw error
  }

  return data
}

/**
 * Récupère les textes attribués à un traducteur donné.
 * On joint la table 'translation' pour récupérer les infos d'attribution.
 * @param {string} translatorId trigramme du traducteur
 * @returns {Promise<Array>} textes avec leurs métadonnées d'attribution
 */
export async function getTextsForTranslator(translatorId) {
  // On part de la table translation et on joint le texte associé
  const { data, error } = await supabase
    .from('translation')
    .select(`
      attributed,
      deadline,
      finished,
      text:text (
        id, cote, title, received, deadline, wordcount, precedent
      )
    `)
    .eq('translator', translatorId)
    .order('deadline', { ascending: true })

  if (error) {
    console.error('Erreur lors de la récupération des traductions :', error)
    throw error
  }

  // On reformate pour avoir une structure plus simple à consommer
  return data.map((row) => ({
    ...row.text,
    attributed: row.attributed,
    translationDeadline: row.deadline,
    finished: row.finished,
  }))
}

/**
 * Récupère les textes attribués à un éditeur donné.
 * Comme pour le traducteur, on part de la table 'edition'.
 * @param {string} editorId trigramme de l'éditeur
 */
export async function getTextsForEditor(editorId) {
  const { data, error } = await supabase
    .from('edition')
    .select(`
      attributed,
      finished,
      translated_by,
      text:text (
        id, cote, title, received, deadline, wordcount, precedent
      )
    `)
    .eq('editor', editorId)
    .order('text(deadline)', { ascending: true })

  if (error) {
    console.error('Erreur lors de la récupération des éditions :', error)
    throw error
  }

  return data.map((row) => ({
    ...row.text,
    attributed: row.attributed,
    finished: row.finished,
    translatedBy: row.translated_by,
  }))
}

/**
 * Récupère TOUS les textes avec leur état d'attribution
 * (traduction et édition), pour la vue répartiteur.
 *
 * On combine 3 requêtes :
 *  - tous les textes
 *  - toutes les traductions (avec leur traducteur)
 *  - toutes les éditions (avec leur éditeur)
 *
 * Puis on assemble côté JS car PostgREST ne permet pas facilement
 * un LEFT JOIN multiple avec sélection optionnelle.
 *
 * @returns {Promise<Array>} liste enrichie de textes avec leur statut
 */
export async function getAllTextsWithStatus() {
  const [textsRes, translationsRes, editionsRes] = await Promise.all([
    supabase
      .from('text')
      .select('id, cote, title, received, deadline, wordcount, precedent')
      .order('deadline', { ascending: true }),
    supabase
      .from('translation')
      .select('text, translator, attributed, deadline, finished'),
    supabase
      .from('edition')
      .select('text, editor, attributed, finished, translated_by'),
  ])

  if (textsRes.error) throw textsRes.error
  if (translationsRes.error) throw translationsRes.error
  if (editionsRes.error) throw editionsRes.error

  // Indexation des attributions par id de texte pour des lookups en O(1)
  const translationByText = new Map()
  for (const t of translationsRes.data) {
    translationByText.set(t.text, t)
  }
  const editionByText = new Map()
  for (const e of editionsRes.data) {
    editionByText.set(e.text, e)
  }

  // On enrichit chaque texte avec son statut
  return textsRes.data.map((text) => {
    const translation = translationByText.get(text.id) ?? null
    const edition = editionByText.get(text.id) ?? null

    return {
      ...text,
      translation, // null si pas attribué
      edition,     // null si pas attribué
    }
  })
}