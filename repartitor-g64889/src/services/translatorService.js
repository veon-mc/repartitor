import { supabase } from '@/lib/supabase'

/**
 * Récupère tous les traducteurs depuis Supabase.
 * @returns {Promise<Array>} liste de traducteurs { id, firstname, lastname, expectedthroughput }
 * @throws {Error} en cas d'erreur de requête
 */
export async function getTranslators() {
  const { data, error } = await supabase
    .from('translator')
    .select('id, firstname, lastname, expectedthroughput')
    .order('id', { ascending: true })

  if (error) {
    console.error('Erreur lors de la récupération des traducteurs :', error)
    throw error
  }

  return data
}
