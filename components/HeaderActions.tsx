'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Bell, CheckCircle2, Layout, Calendar, Clock, AlertCircle, Users, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import CreateTaskModal from './projects/CreateTaskModal'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import Link from 'next/link'

interface HeaderActionsProps {
    currentUser: any
}

export default function HeaderActions({ currentUser }: HeaderActionsProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()
    const createDropdownRef = useRef<HTMLDivElement>(null)
    const notificationsDropdownRef = useRef<HTMLDivElement>(null)

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (createDropdownRef.current && !createDropdownRef.current.contains(event.target as Node)) {
                setIsCreateOpen(false)
            }
            if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!currentUser?.id) return
        fetchNotifications()

        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUser.id}`,
                },
                () => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUser?.id])

    const fetchNotifications = async () => {
        if (!currentUser?.id) return
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.read).length)
        }
    }

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
        fetchNotifications()
    }

    if (!currentUser) return null

    return (
        <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50/50 dark:bg-slate-800/40 text-gray-400 dark:text-slate-500 hover:text-[#6366f1] transition-all border border-gray-100 dark:border-slate-800/50 active:scale-95"
                title="Toggle Theme"
            >
                {mounted && (theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />)}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsDropdownRef}>
                <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all relative ${isNotificationsOpen ? 'bg-[#f3f4ff] dark:bg-indigo-500/10 border-[#6366f1] text-[#6366f1]' : 'bg-white/50 dark:bg-slate-900/40 border-gray-100 dark:border-slate-800/50 text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm'}`}
                >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
                    )}
                </button>

                {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-5 border-b border-gray-50 dark:border-slate-800/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Notifications</h3>
                            <span className="text-[10px] font-black text-[#6366f1] bg-[#f3f4ff] dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg tracking-wider">{unreadCount} NEW</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => markAsRead(n.id)}
                                        className={`w-full p-4 text-left flex gap-3 transition-all border-b border-gray-50 dark:border-slate-800 last:border-none ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${n.type === 'task' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                                            n.type === 'message' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' :
                                                'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500'
                                            }`}>
                                            {n.type === 'task' ? <Clock size={16} /> : <AlertCircle size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs mb-0.5 ${!n.read ? 'font-bold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{n.title || n.message}</p>
                                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{n.content || n.message}</p>
                                        </div>
                                        {!n.read && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] mt-1.5 flex-shrink-0"></div>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-10 text-center flex flex-col items-center">
                                    <Bell size={20} className="text-gray-200 dark:text-slate-800 mb-3" />
                                    <p className="text-[11px] font-medium text-gray-400 italic">No notifications yet</p>
                                </div>
                            )}
                        </div>
                        <Link href="/notifications" className="block text-center p-3 text-[10px] font-bold text-[#6366f1] hover:bg-gray-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest border-t border-gray-50 dark:border-slate-800">
                            See All
                        </Link>
                    </div>
                )}
            </div>

            {/* Create Dropdown */}
            <div className="relative" ref={createDropdownRef}>
                <button
                    onClick={() => setIsCreateOpen(!isCreateOpen)}
                    className="flex items-center gap-2 bg-[#6366f1] text-white px-3 lg:px-4 py-2.5 rounded-xl hover:bg-[#5558e3] transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span className="hidden lg:inline text-[13px] font-black uppercase tracking-widest">Create</span>
                </button>

                {isCreateOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                        <button
                            onClick={() => {
                                setIsTaskModalOpen(true)
                                setIsCreateOpen(false)
                            }}
                            className="w-full h-11 flex items-center gap-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-[#6366f1] transition-all"
                        >
                            <Plus size={16} className="text-indigo-500" />
                            New Task
                        </button>
                        <Link
                            href="/projects"
                            className="w-full h-11 flex items-center gap-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                        >
                            <Layout size={16} className="text-emerald-500" />
                            New Project
                        </Link>
                        <Link
                            href="/teams/new"
                            className="w-full h-11 flex items-center gap-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 transition-all"
                        >
                            <Users size={16} className="text-blue-500" />
                            New Team
                        </Link>
                    </div>
                )}
            </div>

            <CreateTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
            />
        </div>
    )
}
