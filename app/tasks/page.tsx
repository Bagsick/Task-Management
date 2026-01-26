import { createServerSupabaseClient } from '@/lib/supabase/server'
import TaskList from '@/components/TaskList'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'

export default async function TasksPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      projects:project_id (
        id,
        name
      ),
      assignee:assigned_to (
        id,
        full_name,
        email
      )
    `)
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage all your assigned tasks
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/tasks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Task
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <TaskList tasks={tasks || []} />
      </div>
    </div>
  )
}

