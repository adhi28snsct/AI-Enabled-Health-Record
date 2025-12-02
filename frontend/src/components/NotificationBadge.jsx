import { Bell } from "lucide-react";

export default function NotificationBadge({ count = 0, onClick }) {
  const displayCount = count > 9 ? "9+" : count;

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-100 transition ease-in-out duration-150"
      title="Notifications"
    >
      <Bell className="w-6 h-6 text-gray-700" />

      {/* Badge */}
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-600 text-white text-xs 
                     font-semibold rounded-full min-w-[18px] h-[18px] 
                     flex items-center justify-center shadow-md"
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
