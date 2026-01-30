import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InboxClient from '@/components/InboxClient'

export default async function InboxPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch conversations where user is a participant (Direct Messages)
    const { data: directConversations } = await supabase
        .from('conversation_participants')
        .select(`
            conversation_id,
            conversations (
                id,
                created_at,
                is_team,
                team_id,
                name,
                avatar_url,
                messages (
                    content,
                    created_at,
                    sender_id
                )
            ),
            user:user_id (
                id,
                full_name,
                email,
                avatar_url
            )
        `)
        .eq('user_id', user.id)

    // Fetch team conversations (where user is a team member)
    const { data: teamConversations } = await supabase
        .from('conversations')
        .select(`
            id,
            created_at,
            is_team,
            team_id,
            name,
            avatar_url,
            messages (
                content,
                created_at,
                sender_id
            )
        `)
        .eq('is_team', true)
    // RLS handles filtering by team membership

    // Combine and format conversations for the client
    const formattedDirect = (directConversations as any[])?.map(pc => ({
        ...pc.conversations,
        user: pc.user,
        conversation_id: pc.conversation_id
    })) || []

    const formattedTeams = (teamConversations as any[])?.map(tc => ({
        ...tc,
        conversation_id: tc.id,
        is_team: true
    })) || []

    const allConversations = [...formattedDirect, ...formattedTeams].sort((a, b) => {
        const aDate = a.messages?.[0]?.created_at || a.created_at
        const bDate = b.messages?.[0]?.created_at || b.created_at
        return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

    return <InboxClient initialConversations={allConversations} currentUser={user} />
}
