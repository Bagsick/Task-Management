import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Plus, Users } from 'lucide-react'
import Link from 'next/link'
import TeamCard from '@/components/teams/TeamCard'
import CreateTeamButton from '@/components/teams/CreateTeamButton'
import TeamInvitations from '@/components/teams/TeamInvitations'

export default async function TeamsPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch teams where user is a member
    const { data: teams } = await supabase
        .from('teams')
        .select(`
      *,
      team_members (count)
    `)
        .in('id', (
            await supabase
                .from('team_members')
                .select('team_id')
                .eq('user_id', user.id)
        ).data?.map(m => m.team_id) || [])

    return (
        <div className="px-4 py-6 sm:px-0">
            <TeamInvitations />
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {teams?.length || 0} Total teams are added
                    </p>
                </div>
                <CreateTeamButton />
            </div>

            {teams && teams.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                        <TeamCard
                            key={team.id}
                            team={team}
                            memberCount={team.team_members[0]?.count || 0}
                            isOwner={team.owner_id === user.id}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new team or wait for an invitation.
                    </p>
                    <div className="mt-6">
                        <CreateTeamButton />
                    </div>
                </div>
            )}
        </div>
    )
}
