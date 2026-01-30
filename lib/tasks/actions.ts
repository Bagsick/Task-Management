'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(data: {
    title: string
    description?: string
    status: string
    priority?: string
    due_date?: string
    due_time?: string
    task_tag?: string
    project_id: string
    assigned_to?: string
}) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('tasks')
        .insert({
            ...data,
            created_by: user.id,
            updated_at: new Date().toISOString()
        })

    if (error) throw error

    revalidatePath(`/projects/${data.project_id}`)
    revalidatePath(`/projects/${data.project_id}/tasks`)
    revalidatePath('/dashboard')
}
