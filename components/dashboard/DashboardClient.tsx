'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import CreateTaskModal from '@/components/projects/CreateTaskModal'
// import CreateTeamModal from '@/components/teams/CreateTeamModal' // To be created

export function DashboardActions() {
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)

    return (
        <>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="px-4 py-2 bg-[#f3f4ff] text-[#6366f1] rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#e8e9ff] transition-colors"
                >
                    <Plus size={16} /> Task
                </button>
            </div>
            <CreateTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
        </>
    )
}

export function TeamActions() {
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsTeamModalOpen(true)}
                className="px-5 py-2.5 bg-[#f3f4ff] text-[#6366f1] rounded-2xl font-bold text-sm hover:bg-[#e8e9ff] transition-all flex items-center gap-2"
            >
                <Plus size={18} /> Team
            </button>
            {/* <CreateTeamModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} /> */}
        </>
    )
}

export function SectionDropdown() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-300 hover:text-gray-500 transition-colors"
            >
                <MoreHorizontal size={22} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-[#f3f4ff] hover:text-[#6366f1] transition-colors">
                        View Details
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-[#f3f4ff] hover:text-[#6366f1] transition-colors">
                        Refresh Data
                    </button>
                    <div className="h-px bg-gray-50 my-1 mx-2"></div>
                    <button className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-400 hover:bg-gray-50 transition-colors">
                        Settings
                    </button>
                </div>
            )}
        </div>
    )
}
