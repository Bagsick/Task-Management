import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Calendar, CheckCircle2, Clock, AlertCircle, Plus, FolderKanban } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch user's tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      projects:project_id (
        id,
        name
      )
    `)
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate task statistics
  const taskStats = {
    total: tasks?.length || 0,
    completed: tasks?.filter((t) => t.status === 'completed').length || 0,
    inProgress: tasks?.filter((t) => t.status === 'in_progress').length || 0,
    pending: tasks?.filter((t) => t.status === 'pending').length || 0,
  }

  // Get upcoming deadlines
  const upcomingTasks = tasks
    ?.filter((task) => task.due_date && new Date(task.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5)

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here's an overview of your projects and tasks.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Tasks
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {taskStats.completed}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    In Progress
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {taskStats.inProgress}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {taskStats.pending}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderKanban className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Projects
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {projects?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
            <Link
              href="/projects"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {projects && projects.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <li key={project.id} className="py-3">
                    <Link
                      href={`/projects/${project.id}`}
                      className="block hover:bg-gray-50 rounded-md p-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {project.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {project.description || 'No description'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No projects yet. Create your first project!
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {upcomingTasks && upcomingTasks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {upcomingTasks.map((task) => (
                  <li key={task.id} className="py-3">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="block hover:bg-gray-50 rounded-md p-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {task.title}
                          </p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            <p className="text-sm text-gray-500">
                              {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </p>
                            {task.projects && (
                              <span className="ml-2 text-xs text-gray-400">
                                • {task.projects.name}
                              </span>
                            )}
                          </div>
                        </div>
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
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No upcoming deadlines
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

