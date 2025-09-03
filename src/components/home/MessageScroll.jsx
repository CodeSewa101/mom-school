// src/components/home/MessageScroll.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function MessageScroll() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveNotifications = async () => {
      try {
        const notificationsRef = collection(db, "notifications");
        const q = query(
          notificationsRef,
          where("isActive", "==", true),
          orderBy("priority", "desc"),
          orderBy("createdAt", "desc")
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

  if (loading) {
    return (
      <div className="bg-blue-600 text-white py-3 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">Loading announcements...</div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return null; // Don't show anything if no active notifications
  }

  // Extract only messages from notifications
  const allMessages = notifications.map((n) => n.message);
  const scrollingContent = [...allMessages, ...allMessages].join(" ••• ");

  return (
    <div className="bg-blue-600 text-white py-3 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto flex items-center">
        <span className="font-semibold mr-3 whitespace-nowrap shrink-0">
          Announcements:
        </span>

        <div className="relative overflow-hidden flex-1">
          <div
            className="whitespace-nowrap inline-block animate-marquee"
            style={{
              animationDuration: `${allMessages.length * 5}s`,
              paddingLeft: "100%",
            }}
          >
            {scrollingContent}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
