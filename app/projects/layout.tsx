import type { Metadata } from 'next'
import DashboardLayout from '@/components/DashboardLayout'

export const metadata: Metadata = {
  title: 'Projects | Task-O',
  description: 'Manage your projects and tasks',
}

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardLayout>{children}</DashboardLayout>
}