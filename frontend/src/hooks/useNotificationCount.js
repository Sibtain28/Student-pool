

import { useState, useEffect } from 'react';

// const API_URL = "http://localhost:4000";
const API_URL = "https://student-pool.onrender.com";

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        const data = await response.json();
        const count = data.notifications?.filter(n => !n.is_read).length || 0;
        setUnreadCount(count);
        
        // Update localStorage for consistency
        localStorage.setItem('unreadNotificationCount', count.toString());
        
        // Dispatch event so other components can sync
        window.dispatchEvent(new Event('notificationCountUpdated'));
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotificationCount();

    // Poll every 30 seconds (adjust as needed)
    const interval = setInterval(fetchNotificationCount, 30000);

    // Listen for manual updates from other components
    const handleUpdate = () => fetchNotificationCount();
    window.addEventListener('notificationCountUpdated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationCountUpdated', handleUpdate);
    };
  }, []);

  return { unreadCount, loading, refresh: fetchNotificationCount };
}