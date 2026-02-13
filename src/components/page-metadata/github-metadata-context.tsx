"use client";

import { createContext, useContext } from "react";

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  committer: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GitHubMetadataResponse {
  latestCommit: GitHubCommit;
  firstCommit: GitHubCommit | null;
  historyUrl: string;
}

interface GitHubMetadataContextType {
  data: GitHubMetadataResponse | null;
}

const GitHubMetadataContext = createContext<
  GitHubMetadataContextType | undefined
>(undefined);

export function GitHubMetadataProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: GitHubMetadataResponse | null;
}) {
  return (
    <GitHubMetadataContext.Provider value={{ data }}>
      {children}
    </GitHubMetadataContext.Provider>
  );
}

export function useGitHubMetadata() {
  const context = useContext(GitHubMetadataContext);
  if (context === undefined) {
    throw new Error(
      "useGitHubMetadata must be used within a GitHubMetadataProvider"
    );
  }
  return context;
}
