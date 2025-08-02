import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { X, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function NotificationBar() {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const today = new Date();
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('isActive', '==', true),
      where('expiryDate', '>=', today),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = [];
      snapshot.forEach((doc) => {
        notificationData.push({ id: doc.id, ...doc.data() });
      });
      
      setNotifications(notificationData);
      setIsVisible(notificationData.length > 0);
      setCurrentIndex(0);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (notifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [notifications.length]);

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  const currentNotification = notifications[currentIndex];

  const getIconAndColor = (type) => {
    switch (type) {
      case 'warning':
        return { icon: AlertCircle, color: 'bg-yellow-500', textColor: 'text-yellow-800' };
      case 'success':
        return { icon: CheckCircle, color: 'bg-green-500', textColor: 'text-green-800' };
      case 'error':
        return { icon: AlertCircle, color: 'bg-red-500', textColor: 'text-red-800' };
      default:
        return { icon: Info, color: 'bg-blue-500', textColor: 'text-blue-800' };
    }
  };

  const { icon: Icon, color, textColor } = getIconAndColor(currentNotification.type);

  return (
    <div className={`${color} text-white py-3 px-4 relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {currentNotification.title}
            </p>
            {currentNotification.message && (
              <p className="text-xs opacity-90 truncate">
                {currentNotification.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {notifications.length > 1 && (
            <div className="hidden sm:flex items-center space-x-1 text-xs">
              {notifications.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrolling animation for long text */}
      <div className="absolute inset-0 bg-white bg-opacity-10 animate-pulse opacity-20"></div>
    </div>
  );
}