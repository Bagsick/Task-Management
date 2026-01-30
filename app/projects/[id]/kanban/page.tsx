'use client'

import { use } from 'react'
import KanbanBoard from '@/components/KanbanBoard'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ProjectKanbanPage({ params }: { params: { id: string } }) {
    const { id } = params
    const [user, setUser] = useState<any>(null)
    const [project, setProject] = useState<any>(null)

    useEffect(() => {
        const fetchContext = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            const { data: project } = await supabase
                .from('projects')
                .select('name')
                .eq('id', id)
                .single()

            setProject(project)
        }
        fetchContext()
    }, [id])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Kanban Board</h1>
                <p className="text-sm font-medium text-gray-400 dark:text-slate-500 italic">{project?.name || 'Loading Project...'}</p>
            </div>

            <div className="bg-white dark:bg-slate-900/40 p-1 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm min-h-[600px] backdrop-blur-xl">
                <KanbanBoard projectId={id} userId={user?.id} />
            </div>
        </div>
    )
}
