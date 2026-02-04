import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Signup | Task-O',
  description: 'Login to your TaskFlow account',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}