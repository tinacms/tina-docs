import GithubConfig from "@/src/utils/githubConfig";
import type { GitHubMetadataResponse, GitHubCommit } from "@/src/contexts/github-metadata-context";

export async function fetchGitHubMetadata(
  path?: string
): Promise<{ data: GitHubMetadataResponse | null; error: string | null }> {
  try {
    const owner = GithubConfig.Owner;
    const repo = GithubConfig.Repo;
    const githubToken = GithubConfig.Accesstoken;

    if (!owner || !repo) {
      return {
        data: null,
        error: "GitHub owner and repo must be configured",
      };
    }

    if (!githubToken) {
      return {
        data: null,
        error: "GitHub token is not configured",
      };
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
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!commitsResponse.ok) {
      return {
        data: null,
        error: `GitHub API error: ${commitsResponse.status}`,
      };
    }

    const commits: GitHubCommit[] = await commitsResponse.json();

    if (!commits || commits.length === 0) {
      return {
        data: null,
        error: "No commits found",
      };
    }

    const latestCommit = commits[0];
    let firstCommit: GitHubCommit | null = null;

    if (path) {
      const allCommitsUrl = `${apiUrl}&per_page=100`;
      const allCommitsResponse = await fetch(allCommitsUrl, { 
        headers,
        next: { revalidate: 3600 }
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
        next: { revalidate: 3600 }
      });

      if (firstCommitResponse.ok) {
        const firstCommits: GitHubCommit[] = await firstCommitResponse.json();
        if (firstCommits.length > 0) {
          try {
            const rootCommitUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
            const rootResponse = await fetch(rootCommitUrl, { 
              headers,
              next: { revalidate: 3600 }
            });
            if (rootResponse.ok) {
              const rootCommits: GitHubCommit[] = await rootResponse.json();
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

    return {
      data: {
        latestCommit,
        firstCommit,
        historyUrl,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching GitHub metadata:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch metadata",
    };
  }
}
