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