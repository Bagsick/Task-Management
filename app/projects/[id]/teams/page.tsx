import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Users, Shield, Plus } from 'lucide-react'
import InviteProjectMemberModal from '@/components/projects/InviteProjectMemberModal'
import ProjectMembersTable from '@/components/projects/ProjectMembersTable'
import CreateTeamButton from '@/components/teams/CreateTeamButton'

export default async function ProjectTeamsPage({ params }: { params: { id: string } }) {
    const { id } = params
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch project details
    const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', id)
        .single()

    // Fetch project members
    const { data: members } = await supabase
        .from('project_members')
        .select(`
            id,
            role,
            joined_at,
            user:user_id (
                id,
                full_name,
                email,
                avatar_url
            )
        `)
        .eq('project_id', id)
        .order('role', { ascending: true })

    // Check current user's role
    const currentUserMember = members?.find(m => (m.user as any).id === user.id)
    const currentUserRole = currentUserMember?.role || 'member'
    const canManage = currentUserRole === 'admin' || currentUserRole === 'manager'

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 dark:border-slate-800/50 pb-10">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#f3f4ff] dark:bg-indigo-500/10 flex items-center justify-center text-[#6366f1]">
                            <Users size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-slate-50 tracking-tight">Project Team</h1>
                    </div>
                    <p className="text-sm font-medium text-gray-400 dark:text-slate-500 italic">
                        Managing collaborators for <span className="text-gray-900 dark:text-slate-200 font-bold not-italic">{project?.name}</span>
                    </p>
                </div>
                {canManage && (
                    <div className="flex items-center gap-3">
                        <CreateTeamButton initialProjectId={id} />
                        <InviteProjectMemberModal projectId={id} />
                    </div>
                )}
            </div>

            {/* Members Section */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 flex items-center gap-3">
                        Project Members
                        <span className="text-xs bg-gray-50 dark:bg-slate-900/50 text-gray-400 dark:text-slate-500 px-3 py-1 rounded-xl border border-gray-100 dark:border-slate-800/50">{members?.length || 0}</span>
                    </h2>
                </div>
                <ProjectMembersTable
                    members={members || []}
                    currentUserRole={currentUserRole}
                    projectId={id}
                    currentUserId={user.id}
                />
            </section>
        </div>
    )
}
