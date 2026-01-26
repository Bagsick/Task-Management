'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Check, Trash2 } from 'lucide-react'

interface NotificationActionsProps {
  notificationId: string
  isRead: boolean
}

export default function NotificationActions({
  notificationId,
  isRead,
}: NotificationActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkAsRead = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this notification?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error deleting notification:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {!isRead && (
        <button
          onClick={handleMarkAsRead}
          disabled={loading}
          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          title="Mark as read"
        >
          <Check className="h-3 w-3" />
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
        title="Delete"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}

