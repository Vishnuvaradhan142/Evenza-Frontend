import React, { createContext, useState, useEffect, useCallback } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState(null);
  const [toastClosing, setToastClosing] = useState(false);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const showToast = useCallback((notif) => {
    setToast(notif);
    setToastClosing(false);

    setTimeout(() => {
      setToastClosing(true);
      setTimeout(() => setToast(null), 400);
    }, 2500);
  }, []);

  const addNotification = useCallback((notif) => {
    const newNotif = {
      id: Date.now(),
      ...notif,
      read: false,
      time: "Just now",
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(newNotif);
  }, [showToast]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearNotifications,
        toast,
        toastClosing,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};