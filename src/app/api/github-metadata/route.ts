import GithubConfig from "@/src/utils/githubConfig";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface GitHubCommit {
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

interface GitHubMetadataResponse {
  latestCommit: GitHubCommit;
  firstCommit: GitHubCommit | null;
  historyUrl: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const owner = GithubConfig.Owner
    const repo = GithubConfig.Repo

    if(!owner || !repo) {
        throw new Error("GITHUB_OWNER and GITHUB_REPO must be set in environment secrets");
    }

    const path = searchParams.get("path");

    // GitHub API token from environment variable (optional but recommended for higher rate limits)
    const githubToken = GithubConfig.Accesstoken;

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": repo,
    };

    if(!githubToken) {
        throw new Error("GITHUB_TOKEN is not set in environment secrets");
    }

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    // Build the API URL for commits
    let apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
    if (path) {
      apiUrl += `?path=${encodeURIComponent(path)}`;
    }

    // Fetch the latest commit
    const commitsResponse = await fetch(apiUrl);

    const commits: GitHubCommit[] = await commitsResponse.json();

    if (!commits || commits.length === 0) {
      return NextResponse.json(
        { error: "No commits found" },
        { status: 404 }
      );
    }

    const latestCommit = commits[0];

    let firstCommit: GitHubCommit | null = null;

    if (path) {
      const allCommitsUrl = `${apiUrl}&per_page=100`;
      const allCommitsResponse = await fetch(allCommitsUrl, );

      if (allCommitsResponse.ok) {
        const allCommits: GitHubCommit[] = await allCommitsResponse.json();
        if (allCommits.length > 0) {
          firstCommit = allCommits[allCommits.length - 1];
        }
      }
    } else {
      // For repo-wide, fetch commits in reverse order
      const firstCommitUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1&sha=HEAD`;
      const firstCommitResponse = await fetch(firstCommitUrl);

      if (firstCommitResponse.ok) {
        const firstCommits: GitHubCommit[] = await firstCommitResponse.json();
        if (firstCommits.length > 0) {
          // Get the very first commit by traversing to the root
          try {
            const rootCommitUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
            const rootResponse = await fetch(rootCommitUrl);
            if (rootResponse.ok) {
              const rootCommits: GitHubCommit[] = await rootResponse.json();
              // This is a simplified approach - for a more accurate first commit,
              // you might need to traverse the commit tree
              firstCommit = rootCommits.length > 0 ? rootCommits[0] : null;
            }
          } catch (err) {
            console.error("Error fetching first commit:", err);
          }
        }
      }
    }

    // Build history URL
    const historyUrl = path
      ? `https://github.com/${owner}/${repo}/commits/HEAD/${path}`
      : `https://github.com/${owner}/${repo}/commits`;

    const response: GitHubMetadataResponse = {
      latestCommit,
      firstCommit,
      historyUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching GitHub metadata:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch metadata",
      },
      { status: 500 }
    );
  }
}
