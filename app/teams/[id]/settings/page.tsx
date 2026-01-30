import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Save, Users, Settings } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function TeamSettingsPage({ params, searchParams }: { params: { id: string }, searchParams: { success?: string } }) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const showSuccess = searchParams.success === 'true'

    // Fetch team details
    const { data: team, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error || !team) {
        notFound()
    }

    // Check if user is owner
    if (team.owner_id !== user.id) {
        redirect(`/teams/${params.id}`)
    }

    async function updateTeam(formData: FormData) {
        'use server'
        const name = formData.get('name') as string
        const description = formData.get('description') as string

        const supabase = await createServerSupabaseClient()
        const { error } = await supabase
            .from('teams')
            .update({ name, description, updated_at: new Date().toISOString() })
            .eq('id', params.id)

        if (error) throw error

        revalidatePath(`/teams/${params.id}`)
        revalidatePath(`/teams/${params.id}/settings`)
        redirect(`/teams/${params.id}/settings?success=true`)
    }

    async function deleteTeam() {
        'use server'
        const supabase = await createServerSupabaseClient()
        const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', params.id)

        if (error) throw error

        revalidatePath('/teams')
        redirect('/teams')
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link
                href={`/teams/${params.id}`}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Team
            </Link>

            {showSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 flex items-center shadow-sm animate-in slide-in-from-top-2">
                    <Save className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">Team settings updated successfully!</span>
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Settings className="h-8 w-8 mr-3 text-primary-600" />
                        Team Settings
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your team&apos;s details and preferences.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* General Settings */}
                <form action={updateTeam} className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                            <input
                                required
                                name="name"
                                type="text"
                                defaultValue={team.name}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                defaultValue={team.description}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-900 resize-none"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all shadow-md active:scale-95"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </button>
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="bg-white shadow-sm border border-red-100 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-red-50 bg-red-50/50">
                        <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Delete this team</h3>
                                <p className="text-sm text-gray-500">Once you delete a team, there is no going back. Please be certain.</p>
                            </div>
                            <form action={deleteTeam}>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-6 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all shadow-md active:scale-95"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Team
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
