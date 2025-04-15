"use client";

import React, { createContext, ReactNode } from "react";

type DocsNavigationContextType = {
  children: ReactNode;
};

const DocsNavigationContext = createContext<DocsNavigationContextType>({
  children: null,
});

export const DocsNavigationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <DocsNavigationContext.Provider value={{ children }}>
      {children}
    </DocsNavigationContext.Provider>
  );
};
