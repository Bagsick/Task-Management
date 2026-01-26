import DashboardLayout from '@/components/DashboardLayout'

export default function TeamsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardLayout>{children}</DashboardLayout>
}
