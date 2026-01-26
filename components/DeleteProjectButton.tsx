'use client'

import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
    const router = useRouter()

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this project?')) {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId)

            if (!error) {
                router.push('/projects')
                router.refresh()
            } else {
                alert('Error deleting project: ' + error.message)
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
