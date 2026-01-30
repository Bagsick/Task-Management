'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateTaskModal from '@/components/projects/CreateTaskModal'

export default function ProjectActions({ projectId }: { projectId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 bg-[#1a1a1a] text-white rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95"
            >
                <Plus size={18} /> New Task
            </button>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialProjectId={projectId}
            />
        </>
    )
}
