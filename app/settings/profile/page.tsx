import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/SettingsForm'

export default async function ProfilePage() {
    const supabase = await createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="px-4 py-8 max-w-5xl mx-auto animate-in fade-in duration-700">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Profile</h1>
                <p className="mt-2 text-sm font-medium text-gray-400 italic">
                    Manage your identity and account security
                </p>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-indigo-100/20 p-8 md:p-12">
                <SettingsForm user={user} userProfile={userProfile} />
            </div>
        </div>
    )
}
