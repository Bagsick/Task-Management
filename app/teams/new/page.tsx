'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Layout, Mail, Info, ArrowLeft, Plus } from 'lucide-react'
import { createTeam } from '@/lib/teams/actions'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewTeamPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [projectId, setProjectId] = useState('')
    const [emails, setEmails] = useState('')
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('owner_id', user.id)
            .is('team_id', null)

        setProjects(data || [])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const emailList = emails.split(',').map(e => e.trim()).filter(e => e.length > 0)
            const team = await createTeam(name, description, projectId || undefined, emailList)
            router.push(`/teams/${team.id}`)
            router.refresh()
        } catch (error: any) {
            setError(error.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="px-4 py-8 max-w-3xl mx-auto animate-in fade-in duration-700">
            <div className="mb-10">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#6366f1] transition-colors mb-6 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
                <h1 className="text-4xl font-black text-gray-900 dark:text-slate-50 tracking-tight">Create New Team</h1>
                <p className="mt-2 text-sm font-medium text-gray-400 dark:text-slate-500 italic">
                    Bring your collaborators together in a unified workspace
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-2xl shadow-indigo-100/20 dark:shadow-none p-8 md:p-12 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold animate-in zoom-in duration-200">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Team Identity</label>
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-300 group-focus-within:text-[#6366f1] transition-colors">
                                            <Users size={16} />
                                        </span>
                                        <input
                                            required
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-semibold text-gray-900 dark:text-slate-50 shadow-inner"
                                            placeholder="Team Name"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <span className="absolute top-3 left-3 flex items-center text-gray-300 group-focus-within:text-[#6366f1] transition-colors">
                                            <Info size={16} />
                                        </span>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-semibold text-gray-900 dark:text-slate-50 h-32 resize-none shadow-inner"
                                            placeholder="What is this team working on?"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Context & Collaboration</label>
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-300 group-focus-within:text-[#6366f1] transition-colors">
                                            <Layout size={16} />
                                        </span>
                                        <select
                                            value={projectId}
                                            onChange={(e) => setProjectId(e.target.value)}
                                            className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-semibold text-gray-700 dark:text-slate-200 appearance-none shadow-inner"
                                        >
                                            <option value="" className="dark:bg-slate-900">Select an optional project...</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative group">
                                        <span className="absolute top-3 left-3 flex items-center text-gray-300 group-focus-within:text-[#6366f1] transition-colors">
                                            <Mail size={16} />
                                        </span>
                                        <textarea
                                            value={emails}
                                            onChange={(e) => setEmails(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-semibold text-gray-900 dark:text-slate-50 h-32 resize-none shadow-inner"
                                            placeholder="Invite members (emails separated by commas)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-8 border-t border-gray-50 dark:border-slate-800/50">
                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="inline-flex items-center px-10 py-4 bg-[#6366f1] text-white text-xs font-black rounded-2xl hover:bg-[#5558e3] disabled:opacity-50 transition-all shadow-xl shadow-[#6366f1]/20 active:scale-95 uppercase tracking-widest"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                            ) : (
                                <Plus size={18} className="mr-3" />
                            )}
                            Initialize Team
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
