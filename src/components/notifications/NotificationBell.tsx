// //src/components/notifications/NotificationBell.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { Bell } from "lucide-react";
// import { NotificationDropdown } from "./NotificationDropdown";
// import api from "../../lib/api";

// export function NotificationBell() {
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [open, setOpen] = useState(false);

//   // Fetch unread notifications count
//   const fetchUnreadCount = async () => {

//     try {
//       const res = await api.get("/notifications/unread-count");
//       setUnreadCount(res.data.unread);
//       console.log("[NotificationBell] Unread count:", res.data.unread);
//     } catch (err) {
//       console.error("[NotificationBell] Failed to fetch unread count:", err);
//     }
//   };

//   useEffect(() => {
//     fetchUnreadCount();
//     const interval = setInterval(fetchUnreadCount, 3000); // refresh every 30s
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen((prev) => !prev)}
//         className="relative"
//       >
//         <Bell className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-all duration-200" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 animate-pulse">
//             {unreadCount}
//           </span>
//         )}
//       </button>

//       {open && (
//         <NotificationDropdown
//           onClose={() => setOpen(false)}
//           refreshUnread={fetchUnreadCount} // pass refresh function
//         />
//       )}
//     </div>
//   );
// }


//---------------------------------------------------------------------------//

// "use Client";

// import { useEffect, useState } from "react";
// import { Bell } from "lucide-react";
// import { NotificationDropdown } from "./NotificationDropdown";
// import { useNotificationStore } from "../../store/notificationStore";
// import { connectNotificationSocket } from "../../lib/notificationSocket";
// import api from "../../lib/api";

// export function NotificationBell() {
//   const { unreadCount, setNotifications, setCurrentUserId } = useNotificationStore();
//   const [open, setOpen] = useState(false);

//   // fetch Notification
//   const fetchInitialNotifications = async () => {

//     try {
//       const res = await api.get("/notifications");//return all notifi...
//       if (res?.data?.notifications) {
//         setNotifications(res.data.notifications);
//         console.log("[NotificationBell] notification loaded:", res.data.notifications.length);
//       }

//       if (res?.data?.userId) {
//         setCurrentUserId(res.data.uerId);
//         console.log("[NotificationBell] CurrentUserId received from API", res.data.userId);
//       }
//     } catch (err) {
//       console.error("NotifcatonBell Failed to fetch notif...", err);
//     }
//   };


//   useEffect(() => {
//     console.log("[NotificationBell] Mounting...");
//     let syncInterval: ReturnType<typeof setInterval> | null = null; 

//     // Read user from store
//     fetchInitialNotifications().then(() => {
//       const userIdFromStore = useNotificationStore.getState().currentUserId;
//       if (!userIdFromStore) {
//         console.warn("[NotificationBell] currentUserId missing after API Call; realtime disabled return");
//       }
//       console.log("[NotificationBell] Connecting WebSocket for user:", userIdFromStore);
//       if (userIdFromStore) {
//         connectNotificationSocket(userIdFromStore);
//       }

//       syncInterval = setInterval(() => {
//         console.log("[NotificationBell] Background sync...");
//         fetchInitialNotifications();
//       }, 60000)
//     })

//     return () => {
//       console.log("[NotificationBell] Unmounting...");
//       if (syncInterval) clearInterval(syncInterval);
//     };
//   }, []);


//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen((prev) => !prev)}
//         className="relative" aria-label="Notifications">
//         <Bell className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-all duration-200" />

//         {unreadCount > 0 && (
//           <span
//             id="notif-count"
//             className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 animate-pulse">
//             {unreadCount}
//           </span>
//         )}
//       </button>


//       {open && <NotificationDropdown onClose={() => setOpen(false)} />}
//     </div>
//   );
// } 



"use Client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotificationStore } from "../../store/notificationStore";
import { connectNotificationSocket } from "../../lib/notificationSocket";
import api from "../../lib/api";

export function NotificationBell() {
  const { unreadCount, setNotifications, setCurrentUserId } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false); // Elastic bounce animation for badge
  const [shake, setShake] = useState(false); // Premium shake animation for bell
  const [pulse, setPulse] = useState(false); // Subtle pulse for continuous attention
  const [continuousShake, setContinuousShake] = useState(false); // Continuous shake effect - DISABLED
  const [continuousBounce, setContinuousBounce] = useState(true); // Continuous bounce effect - ENABLED
  const previousUnreadRef = useRef(unreadCount); // Track previous count for comparison
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Cleanup reference

  // Auto shake every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("[NotificationBell]  Auto shake triggered (every 10s)");
      setShake(true);
      setTimeout(() => {
        setShake(false);
        console.log("[NotificationBell]  Auto shake completed");
      }, 2000); // 2 second shake duration
    }, 10000); // 10 second interval

    return () => clearInterval(interval);
  }, []);

  // Fetch initial notifications with error handling
  const fetchInitialNotifications = async () => {
    try {
      // console.log("[NotificationBell] Fetching initial notifications...");
      const res = await api.get("/notifications");

      if (res?.data?.notifications) {
        setNotifications(res.data.notifications);
        console.log("[NotificationBell]  Notifications loaded:", res.data.notifications.length);
      }

      if (res?.data?.userId) {
        setCurrentUserId(res.data.userId);
        console.log("[NotificationBell]  CurrentUserId set:", res.data.userId);
      }
    } catch (err) {
      console.error("[NotificationBell]  Failed to fetch notifications:", err);
    }
  };

  // Premium animation effects when new notifications arrive
  const triggerNotificationEffects = () => {
    // console.log("[NotificationBell]  Triggering premium notification effects...");

    // Clear any existing timeout to prevent conflicts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Trigger all animations simultaneously for maximum impact
    setBounce(true);
    setShake(true);
    setPulse(true);

    // Staggered reset for smooth, natural feel
    animationTimeoutRef.current = setTimeout(() => {
      setBounce(false);
      setShake(false);
      setPulse(false);
      // console.log("[NotificationBell]  Animation effects completed");
    }, 3000); // Longer duration for premium feel
  };

  // Monitor unread count changes with optimized performance
  useEffect(() => {
    const currentUnread = unreadCount;
    const previousUnread = previousUnreadRef.current;

    // Only trigger effects when count actually increases (new notifications)
    if (currentUnread > previousUnread && previousUnread !== undefined) {
      console.log(`[NotificationBell]  New notifications detected: ${previousUnread} → ${currentUnread}`);
      triggerNotificationEffects();
   }

   // Update ref for next comparison
    previousUnreadRef.current = currentUnread;
  }, [unreadCount]);

  // Component mount and WebSocket connection with optimized intervals
  useEffect(() => {
    // console.log("[NotificationBell]  Component mounting...");
    let syncInterval: ReturnType<typeof setInterval> | null = null;

   // Initial fetch and WebSocket setup
    const initializeNotifications = async () => {
      await fetchInitialNotifications();

      const userId = useNotificationStore.getState().currentUserId;
      if (!userId) {
        console.warn("[NotificationBell]  CurrentUserId missing; realtime features disabled");
      } else {
        console.log("[NotificationBell] Connecting WebSocket for user:", userId);
        connectNotificationSocket(userId);
      }

      // Optimized background sync - reduced frequency for better performance
      syncInterval = setInterval(() => {
        console.log("[NotificationBell]  Background sync check...");
        fetchInitialNotifications();
      }, 90000); // 90 seconds instead of 60 for better resource management
    };

    initializeNotifications();

  // Cleanup function
    return () => {
      // console.log("[NotificationBell]  Component unmounting...");
      if (syncInterval) {
        clearInterval(syncInterval);
      //  console.log("[NotificationBell]  Background sync cleared");
      }
      if (animationTimeoutRef.current) {
       clearTimeout(animationTimeoutRef.current);
        // console.log("[NotificationBell]  Animation timeout cleared");
     }
    };
  }, []);

 return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative group transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell
          className={`h-6 w-6 text-gray-600 transition-all duration-300 group-hover:text-blue-600 group-active:scale-95 ${shake ? "animate-premium-shake" : ""
            }`}
          style={{
            animation: shake ? 'premium-shake 2s ease-in-out' : 'none'
          }}
          strokeWidth={2}
        />

        {unreadCount > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full flex items-center justify-center px-1.5 shadow-lg transition-all duration-300  ${
              bounce || continuousBounce ? "slow-bounce" : ""
            }`}
            // style={{
            //   animation: (bounce || continuousBounce) ? 'premium-bounce 6s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite' : 'none'
            // }}
            role="status"
            aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Subtle glow effect for active state */}
       {open && (
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-pulse" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0  bg-opacity-20 "
            onClick={() => setOpen(false)}
            aria-label="Close notifications"/>
          <NotificationDropdown onClose={() => setOpen(false)} />
        </>
      )}

   </div>
  );
}