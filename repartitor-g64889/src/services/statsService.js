import { supabase } from '@/lib/supabase'

/**
 * Récupère les statistiques globales du service sur l'intervalle donné.
 * @param {string} from date ISO de début de période
 * @param {string} to date ISO de fin de période
 * @returns {Promise<Object>} un objet avec les compteurs globaux
 */
export async function getGlobalStats(from, to) {
  const { data, error } = await supabase.rpc('stats_global', {
    from_date: from,
    to_date: to,
  })

  if (error) {
    console.error('Erreur lors de la récupération des stats globales :', error)
    throw error
  }

  // La fonction retourne une seule ligne, mais .rpc() renvoie un tableau
  return data?.[0] ?? null
}

/**
 * Récupère les stats de tous les traducteurs sur l'intervalle.
 * Le filtrage par trigramme se fait côté client (la fonction SQL renvoie tout
 * le monde).
 * @returns {Promise<Array>} liste de stats par traducteur
 */
export async function getTranslatorStats(from, to) {
  const { data, error } = await supabase.rpc('stats_translator', {
    from_date: from,
    to_date: to,
  })

  if (error) {
    console.error('Erreur lors de la récupération des stats traducteurs :', error)
    throw error
  }

  return data ?? []
}

/**
 * Récupère les stats de tous les éditeurs sur l'intervalle.
 */
export async function getEditorStats(from, to) {
  const { data, error } = await supabase.rpc('stats_editor', {
    from_date: from,
    to_date: to,
  })

  if (error) {
    console.error('Erreur lors de la récupération des stats éditeurs :', error)
    throw error
  }

  return data ?? []
}

/**
 * Helper qui filtre les stats par identifiant.
 * Renvoie l'objet correspondant ou null si non trouvé.
 */
export function findStatsById(statsList, id, idKey) {
  return statsList.find((s) => s[idKey] === id) ?? null
}