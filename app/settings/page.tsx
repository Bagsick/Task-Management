import { createServerSupabaseClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="p-10 md:p-14 bg-white dark:bg-slate-900/40 rounded-[48px] border border-gray-100 dark:border-slate-800/50 shadow-2xl shadow-indigo-100/20 dark:shadow-none backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl font-black text-gray-900 dark:text-slate-50 tracking-tightest mb-4">Settings</h1>
        <p className="text-sm font-medium text-gray-400 dark:text-slate-500 italic max-w-md leading-relaxed">
          Fine-tune your personal Task-O experience and account preferences.
        </p>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/50 rounded-[48px] p-2 md:p-4 shadow-xl shadow-indigo-100/10 dark:shadow-none backdrop-blur-2xl">
        <SettingsForm user={user} userProfile={userProfile} />
      </div>
    </div>
  )
}

