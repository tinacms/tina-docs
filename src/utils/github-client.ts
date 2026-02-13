import type { GitHubMetadataResponse, GitHubCommit } from "@/src/components/page-metadata/github-metadata-context";

/**
 * GithubConfig class provides access to GitHub-related configuration values.
 * These values are typically set in environment variables.
 */
export default class GithubConfig {
    static get Accesstoken()
    {
        return process.env.GITHUB_TOKEN;
    }
    static get Owner()
    {
        return process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER;
    }
    static get Repo()
    {
        return process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG;
    }
    static get IsConfigured()
    {
        return !!this.Accesstoken && !!this.Owner && !!this.Repo;
    }

    static async fetchMetadata(
      path?: string
    ): Promise<GitHubMetadataResponse> {
        const owner = this.Owner;
        const repo = this.Repo;
        const githubToken = this.Accesstoken;

        if (!owner || !repo) {
          throw new Error("GitHub owner and repo must be configured");
        }

        if (!githubToken) {
          throw new Error("GitHub token is not configured");
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
          throw new Error(`GitHub API error: ${commitsResponse.status}`);
        }

        const commits: GitHubCommit[] = await commitsResponse.json();

        if (!commits || commits.length === 0) {
          throw new Error("No commits found");
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
    }
}