import React, { createContext, useContext, useState, useMemo } from 'react';

const TemplateContext = createContext(undefined);

export function TemplateProvider({ children }) {
  const [template, setTemplate] = useState(null);
  const clearTemplate = () => setTemplate(null);

  const value = useMemo(() => ({ template, setTemplate, clearTemplate }), [template]);
  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}

export function useTemplate() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error('useTemplate must be used within a TemplateProvider');
  return ctx;
}
