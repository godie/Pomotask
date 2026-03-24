import { db } from './schema'
import { supabase } from '@/lib/supabase'

export async function syncToSupabase() {
  if (!supabase) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const projects = await db.projects.toArray()
  const tasks = await db.tasks.toArray()

  if (projects.length > 0) {
    await supabase.from('projects').upsert(
      projects.map(p => ({ ...p, user_id: user.id }))
    )
  }

  if (tasks.length > 0) {
    await supabase.from('tasks').upsert(
      tasks.map(t => ({ ...t, user_id: user.id }))
    )
  }
}
