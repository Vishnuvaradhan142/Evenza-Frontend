import React, { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { NotificationProvider } from "./context/NotificationContext";
import { TemplateProvider } from "./context/TemplateContext";
import Toast from "./components/Toast";

const getStoredTheme = () => {
  return localStorage.getItem("theme") || "light";
};

function App() {
  const [theme] = useState(getStoredTheme());

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
      <TemplateProvider>
        <NotificationProvider>
          <AppRoutes />
          <Toast />
        </NotificationProvider>
      </TemplateProvider>
  );
}

export default App;