'use client'

import { useState, useEffect } from 'react'
import { createTask } from '@/lib/tasks/actions'
import { ClipboardList, CheckCircle2, AlertCircle, Layout } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase/client'

export default function CreateTaskModal({ isOpen, onClose, initialProjectId }: { isOpen: boolean, onClose: () => void, initialProjectId?: string }) {
    const [title, setTitle] = useState('')
    const [projectId, setProjectId] = useState(initialProjectId || '')
    const [priority, setPriority] = useState('medium')
    const [dueDate, setDueDate] = useState('')
    const [dueTime, setDueTime] = useState('')
    const [taskTag, setTaskTag] = useState('')
    const [assignedTo, setAssignedTo] = useState('')
    const [projects, setProjects] = useState<any[]>([])
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchProjects()
        }
    }, [isOpen])

    const fetchProjects = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('project_members')
            .select(`
                projects (
                    id,
                    name
                )
            `)
            .eq('user_id', user.id)

        const projectList = data?.map((p: any) => p.projects).filter(Boolean) || []
        setProjects(projectList)
        if (projectList.length > 0 && !projectId && !initialProjectId) {
            setProjectId(projectList[0].id)
        }
    }

    useEffect(() => {
        const fetchMembers = async () => {
            if (!projectId) {
                setMembers([])
                return
            }

            const { data } = await supabase
                .from('project_members')
                .select(`
                    users:user_id (
                        id,
                        full_name,
                        email
                    )
                `)
                .eq('project_id', projectId)

            const memberList = data?.map((m: any) => m.users).filter(Boolean) || []
            setMembers(memberList)
            if (memberList.length > 0 && !memberList.find(m => m.id === assignedTo)) {
                setAssignedTo(memberList[0].id)
            }
        }

        fetchMembers()
    }, [projectId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!projectId) {
            setError('Please select a project')
            return
        }

        setLoading(true)
        setSuccess(false)
        setError(null)
        try {
            await createTask({
                title,
                project_id: projectId,
                priority,
                status: 'pending',
                due_date: dueDate || undefined,
                due_time: dueTime || undefined,
                task_tag: taskTag || undefined,
                assigned_to: assignedTo || undefined
            })
            setSuccess(true)
            setTitle('')
            setTimeout(() => {
                setSuccess(false)
                onClose()
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Task"
        >
            {success ? (
                <div className="py-6 text-center animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-500/10 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-slate-50">Task Created!</h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
                        Added successfully to the project.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-2 text-red-600 animate-in slide-in-from-top-2 text-xs font-bold">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5 ml-1">Project</label>
                            <select
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800/50 rounded-xl focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-700 dark:text-slate-200 appearance-none shadow-inner"
                            >
                                <option value="" className="dark:bg-slate-900">Select project...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5 ml-1">Task Title</label>
                            <input
                                autoFocus
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800/50 rounded-xl focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-900 dark:text-slate-50 shadow-inner"
                                placeholder="What needs to be done?"
                            />
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5 ml-1">Assign To</label>
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800/50 rounded-xl focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-700 dark:text-slate-200 appearance-none shadow-inner"
                            >
                                <option value="" className="dark:bg-slate-900">Members...</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id} className="dark:bg-slate-900">{m.full_name || m.email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5 ml-1">Tag</label>
                            <input
                                type="text"
                                value={taskTag}
                                onChange={(e) => setTaskTag(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800/50 rounded-xl focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-900 dark:text-slate-50 shadow-inner"
                                placeholder="e.g. Design"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5 ml-1">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800/50 rounded-xl focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-900 dark:text-slate-50 shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5 ml-1">Time</label>
                            <input
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800/50 rounded-xl focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-900 dark:text-slate-50 shadow-inner"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2 ml-1">Priority</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['low', 'medium', 'high'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${priority === p
                                        ? 'bg-[#f3f4ff] dark:bg-indigo-500/10 border-[#6366f1] text-[#6366f1] ring-2 ring-[#6366f1]/10'
                                        : 'bg-white dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-800 text-[10px] font-black text-gray-400 dark:text-slate-500 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-900 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !projectId}
                            className="flex-1 px-4 py-2.5 bg-[#6366f1] text-white text-[10px] font-black rounded-xl hover:bg-[#5558e3] disabled:opacity-50 transition-all shadow-lg shadow-[#6366f1]/20 active:scale-95 uppercase tracking-widest"
                        >
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
