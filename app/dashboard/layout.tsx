import type { Metadata } from 'next'
import DashboardLayout from '@/components/DashboardLayout'

export const metadata: Metadata = {
  title: 'Dashboard | Task-O',
  description: 'Your project dashboard',
}

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardLayout>{children}</DashboardLayout>
}