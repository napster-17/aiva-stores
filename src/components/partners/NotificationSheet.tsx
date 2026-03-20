//src/components/partners/NotificationSheet.tsx
'use client'

import React from 'react'
import { Bell, Trash2, X, Clock, Inbox } from 'lucide-react'
import { deleteSingleNotification, deleteAllNotifications, AppNotification } from '@/lib/partners/notification-utils'

interface NotificationSheetProps {
  notifications: AppNotification[];
  userId: string;
  onClose: () => void;
  refresh: () => void;
}

export default function NotificationSheet({ notifications, userId, onClose, refresh }: NotificationSheetProps) {
  const handleDeleteAll = async () => {
    if (confirm('Clear all notifications?')) {
      await deleteAllNotifications(userId);
      refresh();
    }
  }

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSingleNotification(id);
    refresh();
  }

  return (
    <>
      {/* Subtle Backdrop */}
      <div className="fixed inset-0 bg-black/[0.02] backdrop-blur-[2px] z-40" onClick={onClose} />
      
      {/* Sleek Dropdown Pane */}
      <div className="fixed top-24 right-4 md:right-10 w-[380px] max-h-[85vh] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-50 rounded-[2.5rem] border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        
        {/* Header - Matching Walk-in Billing Style */}
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
              <Bell size={16} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-[18px] font-black font-bold text-gray-900 leading-none tracking-regular">Notifications</h3>
              <p className="text-[12px] text-orange-500 font-semibold tracking-wider mt-1">
                {notifications.length} New Alerts
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {notifications.length > 0 && (
              <button 
                onClick={handleDeleteAll} 
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete All"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#F8F9FB] custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3">
                <Inbox size={20} className="opacity-50" />
              </div>
              <p className="text-[12px] font-bold uppercase tracking-widest">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="group bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 overflow-hidden relative"
              >
                {/* Delete button overlay */}
                <button 
                  onClick={(e) => handleDeleteOne(notification.id, e)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-md text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                >
                  <X size={10} strokeWidth={3} />
                </button>

                {/* 1. Optimized Image Height */}
                {notification.image_url && (
                  <div className="relative w-full h-32 bg-gray-50 border-b border-gray-50">
                    <img 
                      src={notification.image_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 2. Tightened Content Section */}
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-[13px] text-gray-900 leading-tight">
                        {notification.title}
                      </h4>
                      <p className="text-gray-500 text-[12px] leading-snug mt-1 font-medium">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      <Clock size={10} />
                      {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer info */}
        <div className="p-3 bg-white border-t border-gray-50 text-center">
             <p className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.2em]">• Aiva Stores Private Limited •</p>
        </div>
      </div>
    </>
  )
}