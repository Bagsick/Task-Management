import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Settings, Mail, Shield, User as UserIcon } from 'lucide-react'
import InviteMemberModal from '@/components/teams/InviteMemberModal'
import MemberManagement from '@/components/teams/MemberManagement'

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch team details
    const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', params.id)
        .single()

    if (teamError || !team) {
        notFound()
    }

    // Fetch team members with user details
    const { data: members } = await supabase
        .from('team_members')
        .select(`
      *,
      users (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
        .eq('team_id', params.id)

    // Fetch pending invitations
    const { data: invitations } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', params.id)
        .eq('status', 'pending')

    const userMembership = members?.find(m => m.user_id === user.id)
    const isOwnerOrAdmin = userMembership && ['owner', 'admin'].includes(userMembership.role)

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
                <Link
                    href="/teams"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Teams
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
                        <p className="mt-1 text-sm text-gray-500">{team.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {isOwnerOrAdmin && <InviteMemberModal teamId={team.id} />}
                        <Link
                            href={`/teams/${team.id}/settings`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Team Settings
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Member List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white shadow rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Members</h2>
                            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {members?.length || 0} Total
                            </span>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {members?.map((member) => (
                                <li key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 overflow-hidden">
                                            {member.users?.avatar_url ? (
                                                <img src={member.users.avatar_url} alt={member.users.full_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <UserIcon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {member.users?.full_name || 'Unnamed User'}
                                                {member.user_id === user.id && <span className="ml-2 text-xs text-gray-400 font-normal">(You)</span>}
                                            </p>
                                            <p className="text-xs text-gray-500">{member.users?.email || 'No email'}</p>
                                        </div>
                                    </div>
                                    <MemberManagement
                                        member={member}
                                        currentUserRole={userMembership?.role || 'member'}
                                        isCurrentUser={member.user_id === user.id}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Sidebar: Invitations & Insights */}
                <div className="space-y-6">
                    {isOwnerOrAdmin && (
                        <div className="bg-white shadow rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Mail className="h-5 w-5 mr-2 text-primary-500" />
                                Pending Invitations
                            </h3>
                            {invitations && invitations.length > 0 ? (
                                <ul className="space-y-4">
                                    {invitations.map((invite) => (
                                        <li key={invite.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{invite.email}</p>
                                                <p className="text-xs text-gray-500 capitalize">{invite.role}</p>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {/* We could add logic to revoke invites here */}
                                                <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider bg-yellow-100 px-1.5 py-0.5 rounded">Pending</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4 italic">No pending invitations</p>
                            )}
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            Your Role
                        </h3>
                        <p className="text-sm opacity-90 mb-4">You have <span className="font-bold underline capitalize">{userMembership?.role}</span> permissions in this team.</p>
                        <div className="text-xs bg-white/10 rounded-lg p-3">
                            {userMembership?.role === 'owner' && "You have full control over the team, including deletion and member management."}
                            {userMembership?.role === 'admin' && "You can invite new members and manage most team settings."}
                            {userMembership?.role === 'member' && "You can collaborate on projects and tasks assigned to this team."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
