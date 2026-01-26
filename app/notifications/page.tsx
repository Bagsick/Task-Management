import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Bell, Check, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import NotificationActions from '@/components/NotificationActions'

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-2 text-sm text-gray-600">
          You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {notifications && notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <Bell
                        className={`h-5 w-5 ${!notification.read ? 'text-blue-600' : 'text-gray-400'
                          }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p
                          className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-500'
                            }`}
                        >
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {notification.related_id && (
                        <Link
                          href={notification.type === 'team_invitation' ? '/teams' : `/tasks/${notification.related_id}`}
                          className="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center"
                        >
                          {notification.type === 'team_invitation' ? 'View Teams →' : 'View Task →'}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <NotificationActions
                      notificationId={notification.id}
                      isRead={notification.read}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up! No notifications at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

