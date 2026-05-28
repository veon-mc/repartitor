import { supabase } from '@/lib/supabase'

/**
 * Récupère tous les éditeurs depuis Supabase.
 * @returns {Promise<Array>} liste d'éditeurs { id, firstname, lastname }
 * @throws {Error} en cas d'erreur de requête
 */
export async function getEditors() {
  const { data, error } = await supabase
    .from('editor')
    .select('id, firstname, lastname')
    .order('id', { ascending: true })

  if (error) {
    console.error('Erreur lors de la récupération des éditeurs :', error)
    throw error
  }

  return data
}
