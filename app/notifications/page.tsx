import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Bell, Check, Trash2, Users } from 'lucide-react'
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
    <div className="flex justify-center pt-10">
      <div className="max-w-4xl w-full bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-10">
        <div className="mb-10">
          <h1 className="text-[22px] font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-400 font-medium">
            You can find all settings here.
          </p>
        </div>

        <div className="space-y-8">
          {notifications && notifications.length > 0 ? (
            <ul className="space-y-6">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="flex items-start gap-5 group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${!notification.read ? 'bg-[#f3f4ff] border-[#f3f4ff] text-[#6366f1]' : 'bg-gray-50 border-gray-50 text-gray-400'
                    }`}>
                    {notification.type === 'team_invitation' ? <Users size={20} /> : <Check size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-[15px] font-bold ${!notification.read ? 'text-gray-900' : 'text-gray-500'}`}>
                        {notification.type === 'team_invitation' ? 'Join Request' : 'Task Update'}
                      </p>
                      <span className="text-[12px] font-semibold text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400 font-medium leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.related_id && (
                      <Link
                        href={notification.type === 'team_invitation' ? '/teams' : `/tasks/${notification.related_id}`}
                        className="mt-3 text-[13px] font-bold text-[#6366f1] hover:underline block"
                      >
                        {notification.type === 'team_invitation' ? 'View Team' : 'View Task'}
                      </Link>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <NotificationActions
                      notificationId={notification.id}
                      isRead={notification.read}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium italic">No notifications found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }) {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}hrs ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return format(date, 'dd MMM')
}

