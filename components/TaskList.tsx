'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, Clock, AlertCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  due_date?: string
  assigned_to?: string
  assignee?: {
    full_name?: string
    email?: string
  }
  created_at: string
}

interface TaskListProps {
  tasks: Task[]
  projectId?: string
}

export default function TaskList({ tasks, projectId }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No tasks yet. Create your first task!</p>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
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
    <div className="space-y-4">
      {tasks.map((task) => (
        <Link
          key={task.id}
          href={`/tasks/${task.id}`}
          className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors border border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-0.5">{getStatusIcon(task.status)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  {task.due_date && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(task.due_date), 'MMM dd, yyyy')}
                    </div>
                  )}
                  {task.assignee && (
                    <div className="flex items-center">
                      <span>
                        {task.assignee.full_name || task.assignee.email || 'Unassigned'}
                      </span>
                    </div>
                  )}
                  {task.priority && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

