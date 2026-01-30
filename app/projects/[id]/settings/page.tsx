import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DeleteProjectButton from '@/components/DeleteProjectButton'
import { Settings, Trash2, AlertTriangle } from 'lucide-react'

export default async function ProjectSettingsPage({ params }: { params: { id: string } }) {
    const { id } = params
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify admin access
    const { data: membership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .single()

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (!project) notFound()

    const isAdmin = membership?.role === 'admin' || project.owner_id === user.id

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
                <p className="text-sm text-gray-500 mt-2">Only project admins can access these settings.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Project Settings</h1>
                <p className="text-sm font-medium text-gray-400 dark:text-slate-500 italic">{project.name} • Manage your project configuration</p>
            </div>

            <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm space-y-10 backdrop-blur-xl">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-slate-50 mb-6">Danger Zone</h3>
                    <div className="p-8 border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex gap-5">
                            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-50 dark:border-red-500/20">
                                <Trash2 size={28} />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-red-900 dark:text-red-400">Delete Project</h4>
                                <p className="text-sm text-red-700 dark:text-red-400/70 mt-1 max-w-sm">Once you delete a project, there is no going back. Please be certain.</p>
                            </div>
                        </div>
                        <DeleteProjectButton projectId={id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
