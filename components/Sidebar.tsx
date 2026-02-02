'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Home,
    LayoutDashboard,
    Users,
    FolderKanban,
    ClipboardList,
    BarChart3,
    Settings,
    Bell,
    MessageSquare,
    LogOut,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Plus,
    ArrowLeft,
    User,
    HelpCircle,
    UserPlus,
    X,
    Menu
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useSidebar } from './SidebarContext'

interface SidebarProps {
    currentUser: {
        id: string
        email?: string
        full_name?: string
        avatar_url?: string
    }
}

export default function Sidebar({ currentUser }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [projectContext, setProjectContext] = useState<{ id: string; name: string; role: string } | null>(null)
    const profileRef = useRef<HTMLDivElement>(null)

    // Extract project ID from pathname if exists (/projects/[id]/...)
    const projectIdMatch = pathname.match(/\/projects\/([^\/]+)/)
    const currentProjectId = projectIdMatch ? projectIdMatch[1] : null

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchProjectContext = async () => {
            if (currentProjectId && currentUser?.id) {
                // Fetch project name and user role
                const { data: project } = await supabase
                    .from('projects')
                    .select('id, name')
                    .eq('id', currentProjectId)
                    .single()

                const { data: membership } = await supabase
                    .from('project_members')
                    .select('role')
                    .eq('project_id', currentProjectId)
                    .eq('user_id', currentUser.id)
                    .single()

                if (project && membership) {
                    setProjectContext({
                        id: project.id,
                        name: project.name,
                        role: membership.role
                    })
                }
            } else {
                setProjectContext(null)
            }
        }

        fetchProjectContext()
    }, [currentProjectId, currentUser?.id])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    interface NavItem {
        href: string
        icon: any
        label: string
        roles?: string[]
    }

    const globalItems: NavItem[] = [
        { href: '/dashboard', icon: Home, label: 'Home' },
        { href: '/projects', icon: LayoutDashboard, label: 'Projects' },
        { href: '/inbox', icon: MessageSquare, label: 'Inbox' },
        { href: '/settings', icon: Settings, label: 'Settings' },
    ]

    const projectItems: NavItem[] = [
        { href: `/projects/${currentProjectId}`, icon: Home, label: 'Project Home' },
        { href: `/projects/${currentProjectId}/kanban`, icon: FolderKanban, label: 'Boards' },
        { href: `/projects/${currentProjectId}/tasks`, icon: ClipboardList, label: 'Tasks' },
        { href: `/projects/${currentProjectId}/teams`, icon: Users, label: 'Project Team' },
        { href: `/projects/${currentProjectId}/reports`, icon: BarChart3, label: 'Reports', roles: ['admin', 'manager'] },
        { href: `/projects/${currentProjectId}/settings`, icon: Settings, label: 'Settings', roles: ['admin'] },
    ]

    const activeItems = projectContext ? projectItems : globalItems

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transition-all duration-300 flex flex-col z-50 
                ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'} 
                ${isCollapsed && !isMobileOpen ? 'lg:w-20' : 'lg:w-64'}
                `}
            >
                {/* Brand / Toggle */}
                <div className="p-6 pb-2 flex items-center justify-between">
                    {(!isCollapsed || isMobileOpen) && (
                       <Link
                            href="/dashboard"
                            className="flex items-center transition-all duration-300 hover:scale-110 hover:brightness-125 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        >
                            <img
                                src="/transparent-nav-logo.png" // Make sure this PNG already has "Task-0" text
                                alt="Logo"
                                className="w-auto h-10 lg:h-14 scale-x-130" // Stretch horizontally 150%
                            />
                        </Link>
                    )}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Project Back Button (Contextual) */}
                {projectContext && (!isCollapsed || isMobileOpen) && (
                    <div className="px-4 mb-4">
                        <Link
                            href="/projects"
                            className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <ArrowLeft size={14} />
                            ALL PROJECTS
                        </Link>
                        <div className="mt-2 text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                            {projectContext.name}
                        </div>
                    </div>
                )}

                {/* Nav Items */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {activeItems.map((item) => {
                        // Role check
                        if (item.roles && projectContext && !item.roles.includes(projectContext.role)) {
                            return null
                        }

                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${isActive
                                    ? 'bg-[#f3f4ff] dark:bg-indigo-500/10 text-[#6366f1] font-semibold'
                                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100 font-medium'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-[#6366f1]' : 'text-gray-400 dark:text-gray-500'} />
                                {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
                                {isActive && (!isCollapsed || isMobileOpen) && (
                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                                )}
                            </Link>
                        )
                    })}

                </nav>

                {/* User / Footer */}
                <div className="p-4 border-t border-gray-100 relative" ref={profileRef}>
                    {isProfileOpen && (
                        <div className={`absolute bottom-full mb-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 py-2 z-[60] animate-in fade-in slide-in-from-bottom-2 duration-200 ${isCollapsed ? 'left-4 w-48' : 'left-4 right-4'}`}>
                            <Link
                                href="/settings/profile"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-[#f3f4ff] dark:hover:bg-slate-800 hover:text-[#6366f1] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <User size={18} />
                                </div>
                                My Profile
                            </Link>
                            <Link
                                href="/help"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-[#f3f4ff] dark:hover:bg-slate-800 hover:text-[#6366f1] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <HelpCircle size={18} />
                                </div>
                                Help and Support
                            </Link>
                            <Link
                                href="/invite"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-[#f3f4ff] dark:hover:bg-slate-800 hover:text-[#6366f1] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
                                    <UserPlus size={18} />
                                </div>
                                Invite Friends
                            </Link>
                            <div className="h-px bg-gray-50 dark:bg-slate-800 my-1 mx-2"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                                    <LogOut size={18} />
                                </div>
                                Logout
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex items-center gap-3 flex-1 min-w-0 p-2 rounded-xl transition-all ${isProfileOpen ? 'bg-gray-50 dark:bg-slate-800' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#6366f1] overflow-hidden shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white dark:ring-slate-900 ring-offset-1 ring-offset-gray-50 dark:ring-offset-slate-900">
                                {currentUser.avatar_url ? (
                                    <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    currentUser.full_name?.[0] || currentUser.email?.[0]
                                )}
                            </div>
                            {(!isCollapsed || isMobileOpen) && (
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {currentUser.full_name || 'User'}
                                    </p>
                                </div>
                            )}
                            {(!isCollapsed || isMobileOpen) && <MoreHorizontal size={14} className="text-gray-300 dark:text-gray-600" />}
                        </button>
                        {!isCollapsed || isMobileOpen ? (
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        ) : null}
                    </div>
                </div>
            </aside>
        </>
    )
}
