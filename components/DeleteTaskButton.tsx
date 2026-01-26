'use client'

import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteTaskButton({ taskId, projectId }: { taskId: string, projectId?: string }) {
    const router = useRouter()

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this task?')) {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)

            if (!error) {
                if (projectId) {
                    router.push(`/projects/${projectId}`)
                } else {
                    router.push('/tasks')
                }
                router.refresh()
            } else {
                alert('Error deleting task: ' + error.message)
            }
        }
    }

    return (
        <button
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
        </button>
    )
}
