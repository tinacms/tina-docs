import type {
  GitHubCommit,
  GitHubMetadataResponse,
} from "@/src/components/page-metadata/github-metadata-context";

/**
 * GithubConfig class provides access to GitHub-related configuration values.
 * These values are typically set in environment variables.
 */
export const GithubConfig = {
  get Accesstoken() {
    return process.env.GITHUB_TOKEN;
  },
  get Owner() {
    return process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER;
  },
  get Repo() {
    return process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG;
  },
  get IsConfigured() {
    return (
      !!GithubConfig.Accesstoken && !!GithubConfig.Owner && !!GithubConfig.Repo
    );
  },

  /**
   * Fetches GitHub metadata including commit history for a given file path.
   *
   * @param path - Optional file path to fetch metadata for. If omitted, fetches repo-wide metadata.
   * @returns Promise resolving to GitHubMetadataResponse with commit information, or null if an error occurs.
   *
   * @precondition GITHUB_TOKEN environment variable must be set with a valid GitHub personal access token (classic) with 'public_repo' scope.
   * @precondition GITHUB_OWNER environment variable (or VERCEL_GIT_REPO_OWNER) must be set with the repository owner/organization name.
   * @precondition GITHUB_REPO environment variable (or VERCEL_GIT_REPO_SLUG) must be set with the repository name.
   *
   * @throws Error if any required environment variables are not set.
   *
   * @see README.md for detailed setup instructions.
   */
  async fetchMetadata(path?: string): Promise<GitHubMetadataResponse> {
    const owner = GithubConfig.Owner;
    const repo = GithubConfig.Repo;
    const githubToken = GithubConfig.Accesstoken;

    if (!owner) {
      throw new Error(
        "GitHub metadata error: GITHUB_OWNER environment variable is not set. See README for setup instructions."
      );
    }

    if (!repo) {
      throw new Error(
        "GitHub metadata error: GITHUB_REPO environment variable is not set. See README for setup instructions."
      );
    }

    if (!githubToken) {
      throw new Error(
        "GitHub metadata error: GITHUB_TOKEN environment variable is not set. See README for setup instructions."
      );
    }

    const headers: HeadersInit = {
      "User-Agent": repo,
      Authorization: `Bearer ${githubToken}`,
    };

    // Build the API URL for commits
    let apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
    if (path) {
      apiUrl += `?path=${encodeURIComponent(path)}`;
    }

    // Fetch the latest commit
    const commitsResponse = await fetch(apiUrl, {
      headers,
    });

    if (!commitsResponse.ok) {
      throw new Error(`GitHub API error: ${commitsResponse.status}.`);
    }

    const commits: GitHubCommit[] = await commitsResponse.json();

    if (!commits || commits.length === 0) {
      throw new Error("No commits found for the specified path.");
    }

    const latestCommit = commits[0];
    let firstCommit: GitHubCommit | null = null;

    if (path) {
      const allCommitsUrl = `${apiUrl}&per_page=100`;
      const allCommitsResponse = await fetch(allCommitsUrl, {
        headers,
      });

      if (allCommitsResponse.ok) {
        const allCommits: GitHubCommit[] = await allCommitsResponse.json();
        if (allCommits.length > 0) {
          firstCommit = allCommits[allCommits.length - 1];
        }
      }
    } else {
      // For repo-wide, fetch commits in reverse order
      const firstCommitUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1&sha=HEAD`;
      const firstCommitResponse = await fetch(firstCommitUrl, {
        headers,
      });

      if (firstCommitResponse.ok) {
        const firstCommits: GitHubCommit[] = await firstCommitResponse.json();
        if (firstCommits.length > 0) {
          const rootCommitUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
          const rootResponse = await fetch(rootCommitUrl, {
            headers,
          });
          if (rootResponse.ok) {
            const rootCommits: GitHubCommit[] = await rootResponse.json();
            firstCommit = rootCommits.length > 0 ? rootCommits[0] : null;
          }
        }
      }
    }

    // Build history URL
    const historyUrl = path
      ? `https://github.com/${owner}/${repo}/commits/HEAD/${path}`
      : `https://github.com/${owner}/${repo}/commits`;

    return {
      latestCommit,
      firstCommit,
      historyUrl,
    };
  },
} as const;

export default GithubConfig;
