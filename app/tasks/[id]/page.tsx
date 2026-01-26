import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Calendar, User, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import TaskComments from '@/components/TaskComments'
import DeleteTaskButton from '@/components/DeleteTaskButton'

export default async function TaskDetailPage({
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

  const { data: task } = await supabase
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
      ),
      creator:created_by (
        id,
        full_name,
        email
      )
    `)
    .eq('id', params.id)
    .single()

  if (!task) {
    notFound()
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link
          href={task.project_id ? `/projects/${task.project_id}` : '/tasks'}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            {task.projects && (
              <Link
                href={`/projects/${task.project_id}`}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                {task.projects.name}
              </Link>
            )}
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/tasks/${params.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <DeleteTaskButton taskId={params.id} projectId={task.project_id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {task.description || 'No description provided'}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-5 w-5 mr-2 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">Comments</h2>
            </div>
            <TaskComments taskId={params.id} userId={user.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Priority</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority || 'Not set'}
                  </span>
                </dd>
              </div>
              {task.due_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(task.due_date), 'MMM dd, yyyy')}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Assigned To
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {task.assignee?.full_name || task.assignee?.email || 'Unassigned'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {task.creator?.full_name || task.creator?.email || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(task.created_at), 'MMM dd, yyyy')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

