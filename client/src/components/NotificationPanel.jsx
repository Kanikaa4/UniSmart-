import React from 'react';
import { X, Bell } from 'lucide-react';

export default function NotificationPanel({ notifications, onClose, onMarkRead }) {
  return (
    <div className="fixed top-0 right-0 w-[320px] h-screen bg-glassSolid backdrop-blur-md border-l border-glassBorder z-[1000] flex flex-col shadow-premium animate-slide-in">
      <div className="flex justify-between items-center p-5 border-b border-glassBorder">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Bell size={16} className="text-primaryIndigo" />
          <span>Notifications</span>
        </h3>
        <button onClick={onClose} className="p-1 rounded bg-white/5 border border-glassBorder text-textSecondary hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onMarkRead(notif.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
              notif.read 
                ? 'bg-white/[0.01] border-glassBorder' 
                : 'bg-primaryIndigo/5 border-primaryIndigo/30 hover:border-primaryIndigo/50'
            }`}
          >
            {!notif.read && (
              <span className="w-2.5 h-2.5 bg-primaryIndigo rounded-full absolute top-4 right-4 shadow-[0_0_8px_#6366f1]"></span>
            )}
            <h4 className="text-xs font-bold text-white pr-4">{notif.title}</h4>
            <p className="text-[10px] text-textSecondary mt-1 leading-normal">{notif.desc}</p>
            <span className="text-[9px] text-textMuted mt-2 block">{notif.time}</span>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-10 text-textMuted text-xs">No active notification logs.</div>
        )}
      </div>
    </div>
  );
}
