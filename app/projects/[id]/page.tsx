import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Calendar,
  User,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layout,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import TaskList from '@/components/TaskList'
import InviteProjectMemberModal from '@/components/projects/InviteProjectMemberModal'
import CreateTeamButton from '@/components/teams/CreateTeamButton'
import ProjectActions from '@/components/projects/ProjectActions'

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch project membership first to verify access
  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    // Check if the user is the owner (fallback for migration)
    const { data: projectCheck } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (projectCheck?.owner_id !== user.id) {
      notFound()
    }
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) {
    notFound()
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:assigned_to (
        id,
        full_name,
        email
      )
    `)
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Fetch project members for the sidebar
  const { data: members, count: memberCount } = await supabase
    .from('project_members')
    .select(`
      id,
      user:user_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('project_id', id)
    .limit(5)

  const taskStats = {
    total: tasks?.length || 0,
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
    inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    pending: tasks?.filter(t => t.status === 'pending').length || 0,
  }

  const canEdit = membership?.role === 'admin' || project.owner_id === user.id

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Project Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">{project.name}</h1>
          <p className="mt-2 text-gray-500 dark:text-slate-500 max-w-2xl">{project.description || 'No description provided for this project.'}</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <>
              <CreateTeamButton initialProjectId={id} />
              <InviteProjectMemberModal projectId={id} />
              <Link
                href={`/projects/${id}/settings`}
                className="p-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 border border-gray-100 dark:border-slate-800/50 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all shadow-sm"
                title="Project Settings"
              >
                <Settings size={20} />
              </Link>
            </>
          )}
          <ProjectActions projectId={id} />
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tasks', value: taskStats.total, icon: Layout, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
          { label: 'Completed', value: taskStats.completed, icon: CheckCircle2, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
          { label: 'In Progress', value: taskStats.inProgress, icon: Clock, color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
          { label: 'Pending', value: taskStats.pending, icon: AlertCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/50 shadow-sm flex items-center gap-4 backdrop-blur-xl">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 dark:text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-50">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List Section */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900/40 rounded-3xl border border-gray-100 dark:border-slate-800/50 shadow-sm overflow-hidden flex flex-col backdrop-blur-xl">
          <div className="p-6 border-b border-gray-50 dark:border-slate-800/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50">Recent Tasks</h2>
            <Link href={`/projects/${id}/tasks`} className="text-sm font-semibold text-[#6366f1] hover:text-[#5558e3] flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="p-6">
            <TaskList tasks={tasks?.slice(0, 5) || []} />
          </div>
        </section>

        {/* Project Details Sidebar */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/50 shadow-sm backdrop-blur-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50 mb-6">Project Info</h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-400 flex items-center gap-2">
                  <Calendar size={16} /> Created at
                </dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-slate-300">
                  {format(new Date(project.created_at), 'MMM dd, yyyy')}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-400 flex items-center gap-2">
                  <Layout size={16} /> Status
                </dt>
                <dd>
                  <span className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    {project.status}
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/50 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">Top Members</h2>
              <Link href={`/projects/${id}/teams`} className="text-xs font-semibold text-[#6366f1]">See All</Link>
            </div>
            <div className="flex -space-x-3 overflow-hidden">
              {members?.map((member: any) => {
                const u = member.user
                return (
                  <div key={member.id} className="inline-block h-10 w-10 rounded-full ring-4 ring-white dark:ring-slate-900 bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-700 overflow-hidden" title={u.full_name}>
                    {u.avatar_url ? (
                      <img src={u.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      u.full_name?.[0] || u.email?.[0]
                    )}
                  </div>
                )
              })}
              {memberCount && memberCount > 5 && (
                <div className="inline-block h-10 w-10 rounded-full ring-4 ring-white dark:ring-slate-900 bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-[#6366f1] border border-gray-100 dark:border-slate-700">
                  +{memberCount - 5}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

