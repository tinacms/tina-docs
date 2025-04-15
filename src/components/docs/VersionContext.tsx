"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

type VersionContextType = {
  currentVersion: string;

  setCurrentVersion: (value: string) => void;
  availableVersions: string[];
};

const defaultContext: VersionContextType = {
  currentVersion: "Latest",
  setCurrentVersion: () => {},
  availableVersions: ["Latest"],
};

const VersionContext = createContext<VersionContextType>(defaultContext);

export const useVersion = () => useContext(VersionContext);

export const VersionProvider = ({
  children,
  initialVersion = "latest",
  versions = ["latest"],
}: {
  children: ReactNode;
  initialVersion?: string;
  versions?: string[];
}) => {
  const [currentVersion, setCurrentVersion] = useState(initialVersion);

  return (
    <VersionContext.Provider
      value={{
        currentVersion,
        setCurrentVersion,
        availableVersions: versions,
      }}
    >
      {children}
    </VersionContext.Provider>
  );
};
