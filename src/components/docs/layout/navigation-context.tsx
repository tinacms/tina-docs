"use client";

import { type ReactNode, createContext, useContext } from "react";

const NavigationContext = createContext<any>(null);

export const NavigationProvider = ({
  children,
  navigationData,
}: {
  children?: ReactNode;
  navigationData: any;
}) => {
  return (
    <NavigationContext.Provider value={navigationData}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
