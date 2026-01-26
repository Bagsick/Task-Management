import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import TaskList from '@/components/TaskList'
import DeleteProjectButton from '@/components/DeleteProjectButton'

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single()

  if (!project) {
    notFound()
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:assigned_to (
        id,
        full_name,
        email
      )
    `)
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  const { data: owner } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', project.owner_id)
    .single()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-2 text-sm text-gray-600">{project.description || 'No description'}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/projects/${params.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <DeleteProjectButton projectId={params.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              <Link
                href={`/tasks/new?project_id=${params.id}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Link>
            </div>
            <TaskList tasks={tasks || []} projectId={params.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'on_hold'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(project.created_at), 'MMM dd, yyyy')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Owner
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {owner?.full_name || owner?.email || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tasks</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {tasks?.length || 0} total tasks
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

