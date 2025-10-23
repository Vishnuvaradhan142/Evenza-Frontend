import React, { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import "./Toast.css";

const Toast = () => {
  const { toast, toastClosing } = useContext(NotificationContext);

  if (!toast) return null;

  return (
    <div className={`toast slide-in ${toastClosing ? "slide-out" : ""}`}>
      <span className={`icon ${toast.type}`}></span>
      {toast.text}
    </div>
  );
};

export default Toast;