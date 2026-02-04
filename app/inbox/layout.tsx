import type { Metadata } from 'next'
import DashboardLayout from '@/components/DashboardLayout'

export const metadata: Metadata = {
  title: 'Inbox | Task-O',
  description: 'View your messages and notifications',
}

export default function InboxLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardLayout>{children}</DashboardLayout>
}