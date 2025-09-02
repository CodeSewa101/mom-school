// // src/components/home/MessageScroll.jsx
// import { useEffect, useState } from "react";
// import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
// import { db } from "../../config/firebase";

// export default function MessageScroll() {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchActiveNotifications = async () => {
//       try {
//         const notificationsRef = collection(db, "notifications");
//         const q = query(
//           notificationsRef,
//           where("isActive", "==", true),
//           orderBy("priority", "desc"),
//           orderBy("createdAt", "desc")
//         );

//         const snapshot = await getDocs(q);
//         const notificationData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setNotifications(notificationData);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching notifications:", error);
//         setLoading(false);
//       }
//     };

//     fetchActiveNotifications();
//   }, []);

//   if (loading) {
//     return (
//       <div className="bg-blue-600 text-white py-3 px-4 overflow-hidden">
//         <div className="max-w-6xl mx-auto">Loading announcements...</div>
//       </div>
//     );
//   }

//   if (notifications.length === 0) {
//     return null; // Don't show anything if no active notifications
//   }

//   // Extract only messages from notifications
//   const allMessages = notifications.map((n) => n.message);
//   const scrollingContent = [...allMessages, ...allMessages].join(" ••• ");

//   return (
//     <div className="bg-blue-600 text-white py-3 px-4 overflow-hidden">
//       <div className="max-w-6xl mx-auto flex items-center">
//         <span className="font-semibold mr-3 whitespace-nowrap shrink-0">
//           {/* Announcements: */}
//         </span>

//         <div className="relative overflow-hidden flex-1">
//           <div
//             className="whitespace-nowrap inline-block animate-marquee"
//             style={{
//               animationDuration: `${allMessages.length * 5}s`,
//               paddingLeft: "100%",
//             }}
//           >
//             {scrollingContent}
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes marquee {
//           0% {
//             transform: translateX(0);
//           }
//           100% {
//             transform: translateX(-50%);
//           }
//         }
//         .animate-marquee {
//           display: inline-block;
//           animation: marquee linear infinite;
//           will-change: transform;
//         }
//       `}</style>
//     </div>
//   );
// }
// src/components/home/MessageScroll.jsx
import { useEffect, useState } from "react";

import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function MessageScroll() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    const fetchActiveNotifications = async () => {
      try {
        const notificationsRef = collection(db, "notifications");
        const q = query(
          notificationsRef,
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(5) // Show only 5 recent notifications in floating view
        );

        const snapshot = await getDocs(q);
        const notificationData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(notificationData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchActiveNotifications();
  }, []);

  const fetchAllNotifications = async () => {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const notificationData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationData);
    } catch (error) {
      console.error("Error fetching all notifications:", error);
    }
  };

  const handleViewAll = () => {
    if (!showAllNotifications) {
      fetchAllNotifications();
    }
    setShowAllNotifications(!showAllNotifications);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">Loading notice board...</div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">NOTICE BOARD</h2>
          <p>No active notifications at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      {/* Header */}
      <div className="text-center py-4 px-4 border-b border-blue-500">
        <h2 className="text-3xl font-bold tracking-wide">NOTICE BOARD</h2>
      </div>

      {/* Notifications Container */}
      <div className="max-w-6xl mx-auto px-4">
        {showAllNotifications ? (
          /* All Notifications View */
          <div className="py-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-blue-200">
                      {formatDate(notification.createdAt)}
                    </span>
                    {notification.priority === "high" && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        HIGH PRIORITY
                      </span>
                    )}
                    {index < 3 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-white font-medium leading-relaxed">
                    • {notification.message}
                  </p>
                  {notification.downloadLink && (
                    <div className="mt-3">
                      <a
                        href={notification.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-200 hover:text-white text-sm underline"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Floating Notifications View */
          <div
            className="py-6 relative overflow-hidden"
            style={{ height: "200px" }}
          >
            <div className="absolute inset-0">
              {notifications.slice(0, 3).map((notification, index) => (
                <div
                  key={notification.id}
                  className="absolute w-full animate-float-up opacity-90 hover:opacity-100"
                  style={{
                    animationDelay: `${index * 2}s`,
                    animationDuration: "8s",
                  }}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mx-4 border border-white/20 shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-blue-200">
                        {formatDate(notification.createdAt)}
                      </span>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                        NEW
                      </span>
                    </div>
                    <p className="text-white font-medium leading-relaxed">
                      • {notification.message}
                    </p>
                    {notification.downloadLink && (
                      <div className="mt-3">
                        <a
                          href={notification.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-200 hover:text-white text-sm underline"
                        >
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center pb-6">
          <button
            onClick={handleViewAll}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {showAllNotifications ? "SHOW RECENT" : "VIEW ALL"}
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120%);
            opacity: 0;
          }
        }

        .animate-float-up {
          animation: float-up linear infinite;
          animation-fill-mode: both;
        }

        /* Custom scrollbar for all notifications view */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
