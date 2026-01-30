'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteProjectMember(projectId: string, email: string, role: 'admin' | 'manager' | 'member') {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Check if current user is owner or admin of the project
    const { data: membership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

    const { data: project } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single()

    if (project?.owner_id !== user.id && (!membership || membership.role !== 'admin')) {
        throw new Error('You do not have permission to invite members to this project')
    }

    // Find user by email
    const { data: targetUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

    if (!targetUser) {
        throw new Error('User with this email not found. They must have an account first.')
    }

    // Add to project_members
    const { error } = await supabase
        .from('project_members')
        .insert({
            project_id: projectId,
            user_id: targetUser.id,
            role: role
        })

    if (error) {
        if (error.code === '23505') throw new Error('User is already a member of this project')
        throw error
    }

    revalidatePath(`/projects/${projectId}`)
    revalidatePath(`/projects/${projectId}/teams`)
}

export async function createProject(name: string, description: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
            name,
            description,
            owner_id: user.id,
            status: 'active'
        })
        .select()
        .single()

    if (projectError) throw projectError

    // Automatically add owner as admin member
    await supabase.from('project_members').insert({
        project_id: project.id,
        user_id: user.id,
        role: 'admin'
    })

    revalidatePath('/projects')
    return project
}
