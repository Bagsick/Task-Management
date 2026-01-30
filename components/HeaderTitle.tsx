'use client'

import { usePathname } from 'next/navigation'

export default function HeaderTitle() {
    const pathname = usePathname()

    const getPageTitle = (path: string) => {
        if (path === '/dashboard') return 'Tasks Home'
        if (path.startsWith('/notifications')) return 'Notification'
        if (path.startsWith('/projects')) return 'Projects'
        if (path.startsWith('/settings')) return 'Settings'
        if (path.startsWith('/inbox')) return 'Inbox'
        return 'Page'
    }

    return (
        <h2 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            {getPageTitle(pathname)}
        </h2>
    )
}
