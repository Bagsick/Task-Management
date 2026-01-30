import { createServerSupabaseClient } from '@/lib/supabase/server'
import TaskList from '@/components/TaskList'
import { Plus, Filter } from 'lucide-react'
import { use } from 'react'

export default async function ProjectTasksPage({ params }: { params: { id: string } }) {
    const { id } = params
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // Fetch project details
    const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', id)
        .single()

    // Fetch project membership for role
    const { data: membership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .single()

    const canCreateTask = membership?.role === 'admin' || membership?.role === 'manager'

    // Fetch all tasks for this project
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Project Tasks</h1>
                    <p className="text-sm font-medium text-gray-400 dark:text-slate-500 italic">{project?.name || 'Loading Project...'}</p>
                </div>
                {canCreateTask && (
                    <button className="px-6 py-3 bg-[#6366f1] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#5558e3] transition-all flex items-center gap-2 shadow-lg shadow-[#6366f1]/20 active:scale-95">
                        <Plus size={16} /> Add New Task
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900/40 p-1 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm backdrop-blur-xl">
                <div className="p-6">
                    <TaskList tasks={tasks || []} />
                </div>
            </div>
        </div>
    )
}
