'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { supabase } from '@/lib/supabase/client'
import { Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

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
  project_id: string
}

interface KanbanBoardProps {
  projectId: string
  userId?: string
}

const columns = [
  { id: 'pending', title: 'Pending', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' },
]

export default function KanbanBoard({ projectId, userId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [winReady, setWinReady] = useState(false)

  useEffect(() => {
    setWinReady(true)
    fetchTasks()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`kanban_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [projectId])

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to (
          id,
          full_name,
          email
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (data) {
      setTasks(data as Task[])
    }
    setLoading(false)
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination, source } = result

    if (source.droppableId === destination.droppableId) return

    const newStatus = destination.droppableId

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === draggableId ? { ...task, status: newStatus } : task
      )
    )

    // Update in database
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', draggableId)

    if (error) {
      console.error('Error updating task:', error)
      fetchTasks() // Revert on error
    } else {
      // Create notification if task was moved to completed
      if (newStatus === 'completed') {
        const task = tasks.find((t) => t.id === draggableId)
        if (task && task.assigned_to) {
          await supabase.from('notifications').insert([
            {
              user_id: task.assigned_to,
              type: 'task_completed',
              message: `Task "${task.title}" has been completed`,
              related_id: task.id,
              created_at: new Date().toISOString(),
            },
          ])
        }
      }
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-blue-500'
      default:
        return 'border-l-gray-300'
    }
  }

  if (loading || !winReady) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">Loading tasks...</p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} rounded-t-lg px-4 py-3 border-b border-gray-200`}>
                <h3 className="text-sm font-semibold text-gray-900">
                  {column.title} ({columnTasks.length})
                </h3>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[400px] p-4 rounded-b-lg border border-t-0 border-gray-200 bg-gray-50 ${snapshot.isDraggingOver ? 'bg-gray-100' : ''
                      }`}
                  >
                    <div className="space-y-3">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${getPriorityColor(
                                task.priority
                              )} ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                            >
                              <Link href={`/tasks/${task.id}`}>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  {task.due_date && (
                                    <div className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {format(new Date(task.due_date), 'MMM dd')}
                                    </div>
                                  )}
                                  {task.assignee && (
                                    <div className="flex items-center">
                                      <User className="h-3 w-3 mr-1" />
                                      {task.assignee.full_name || task.assignee.email}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

