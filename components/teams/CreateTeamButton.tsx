'use client'

import { Plus, Users, Layout, Mail, Info, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createTeam } from '@/lib/teams/actions'
import Modal from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase/client'

export default function CreateTeamButton({ initialProjectId }: { initialProjectId?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [projectId, setProjectId] = useState(initialProjectId || '')
    const [emails, setEmails] = useState('')
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && !initialProjectId) {
            fetchProjects()
        }
    }, [isOpen, initialProjectId])

    const fetchProjects = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('owner_id', user.id)
            .is('team_id', null) // Only show projects not already linked to a team

        setProjects(data || [])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const emailList = emails.split(',').map(e => e.trim()).filter(e => e.length > 0)
            await createTeam(name, description, projectId || undefined, emailList)
            setIsOpen(false)
            setName('')
            setDescription('')
            setProjectId(initialProjectId || '')
            setEmails('')
        } catch (error: any) {
            setError(error.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-xs uppercase tracking-widest shadow-sm shadow-indigo-100/10"
            >
                <Users size={18} className="text-[#6366f1]" />
                Create Team
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Create New Team"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Team Details</label>
                            <div className="space-y-3">
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-300 group-focus-within:text-[#6366f1] transition-colors">
                                        <Users size={16} />
                                    </span>
                                    <input
                                        autoFocus
                                        required
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-semibold text-gray-900"
                                        placeholder="Team Name (e.g. Creative Dept)"
                                    />
                                </div>
                                <div className="relative group">
                                    <span className="absolute top-3 left-3 flex items-center text-gray-300 group-focus-within:text-[#6366f1] transition-colors">
                                        <Info size={16} />
                                    </span>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-semibold text-gray-900 h-24 resize-none"
                                        placeholder="Team Description (Optional)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Link to Project</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-300 group-focus-within:text-[#6366f1] transition-colors">
                                    <Layout size={16} />
                                </span>
                                <select
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-semibold text-gray-700 appearance-none pointer-events-auto"
                                >
                                    <option value="">Select a project...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Invite Members</label>
                            <div className="relative group">
                                <span className="absolute top-3 left-3 flex items-center text-gray-300 group-focus-within:text-[#6366f1] transition-colors">
                                    <Mail size={16} />
                                </span>
                                <textarea
                                    value={emails}
                                    onChange={(e) => setEmails(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-semibold text-gray-900 h-20 resize-none"
                                    placeholder="Enter emails separated by commas..."
                                />
                            </div>
                            <p className="mt-1.5 ml-1 text-[10px] text-gray-400 font-medium font-italic">Invitations will be sent immediately after creation.</p>
                        </div>
                    </div>

                    <div className="flex space-x-4 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-3 border border-gray-100 text-xs font-bold text-gray-400 rounded-2xl hover:bg-gray-50 transition-colors uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="flex-1 px-4 py-3 bg-[#6366f1] text-white text-xs font-bold rounded-2xl hover:bg-[#5558e3] disabled:opacity-50 transition-all shadow-lg shadow-[#6366f1]/20 active:scale-95 uppercase tracking-widest"
                        >
                            {loading ? 'Creating...' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
