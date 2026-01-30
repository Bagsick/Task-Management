import { createServerSupabaseClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default async function ProjectReportsPage({ params }: { params: { id: string } }) {
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

    // Fetch tasks for stats
    const { data: tasks } = await supabase
        .from('tasks')
        .select('status, priority')
        .eq('project_id', id)

    const total = tasks?.length || 0
    const completed = tasks?.filter(t => t.status === 'completed').length || 0
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Project Analytics</h1>
                <p className="text-sm font-medium text-gray-400 dark:text-slate-500 italic">{project?.name || 'Loading Project...'}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Completion Overview */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900/40 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm flex flex-col items-center justify-center text-center backdrop-blur-xl">
                    <div className="relative w-32 h-32 mb-8">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                className="text-gray-100 dark:text-slate-800"
                                strokeDasharray="100, 100"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-[#6366f1]"
                                strokeDasharray={`${completionRate}, 100`}
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-gray-900 dark:text-slate-50 tracking-tighter">{completionRate}%</span>
                            <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Done</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-slate-50 uppercase tracking-widest">Task Completion</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium italic mt-2">{completed} of {total} tasks completed</p>
                </div>

                {/* Priority Breakdown */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm backdrop-blur-xl">
                    <h3 className="text-lg font-black text-gray-900 dark:text-slate-50 uppercase tracking-widest mb-8">Priority Breakdown</h3>
                    <div className="space-y-8">
                        {[
                            { label: 'High Priority', count: tasks?.filter(t => t.priority === 'high').length || 0, color: 'bg-red-500' },
                            { label: 'Medium Priority', count: tasks?.filter(t => t.priority === 'medium').length || 0, color: 'bg-yellow-500' },
                            { label: 'Low Priority', count: tasks?.filter(t => t.priority === 'low').length || 0, color: 'bg-blue-500' },
                        ].map((p, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-gray-700 dark:text-slate-300">{p.label}</span>
                                    <span className="text-gray-400 dark:text-slate-500">{p.count} tasks</span>
                                </div>
                                <div className="h-2.5 w-full bg-gray-50 dark:bg-slate-800 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700/50">
                                    <div
                                        className={`h-full ${p.color} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                        style={{ width: `${total > 0 ? (p.count / total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20">
                <TrendingUp size={48} className="text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Activity Trends</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-sm text-center">
                    Detailed activity trends and productivity metrics will be available as the project progresses.
                </p>
            </div>
        </div>
    )
}
