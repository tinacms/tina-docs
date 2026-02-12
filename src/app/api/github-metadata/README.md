# GitHub Metadata API

This API endpoint fetches GitHub commit metadata for repositories and specific files.

## Endpoint

```
GET /api/github-metadata
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `owner` | string | No | `tinacms` | GitHub repository owner/organization |
| `repo` | string | No | `tina-docs` | GitHub repository name |
| `path` | string | No | - | Optional path to a specific file in the repository |

## Response

Returns a JSON object with the following structure:

```typescript
{
  latestCommit: GitHubCommit;
  firstCommit: GitHubCommit | null;
  historyUrl: string;
}
```

### GitHubCommit Structure

```typescript
{
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string; // ISO 8601 format
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
```

## Examples

### Get latest commit for the entire repository

```bash
GET /api/github-metadata?owner=tinacms&repo=tina-docs
```

### Get commit history for a specific file

```bash
GET /api/github-metadata?owner=tinacms&repo=tina-docs&path=content/docs/index.mdx
```

### Using defaults (tinacms/tina-docs)

```bash
GET /api/github-metadata
```

## Environment Variables

### Optional Configuration

- `GITHUB_TOKEN`: GitHub Personal Access Token for higher API rate limits
  - Create one at https://github.com/settings/tokens
  - Required scopes: `public_repo` (for public repositories)
  - Without a token, you're limited to 60 requests per hour
  - With a token, you get 5,000 requests per hour

Add to your `.env.local`:

```env
GITHUB_TOKEN=ghp_your_token_here
```

## Rate Limiting

- **Without authentication**: 60 requests per hour per IP
- **With authentication**: 5,000 requests per hour

The API will return a 500 error if the GitHub API rate limit is exceeded.

## Error Responses

### 404 - No commits found

```json
{
  "error": "No commits found"
}
```

### 500 - GitHub API error or rate limit exceeded

```json
{
  "error": "GitHub API error: 403"
}
```

## Usage in Components

This API is used by the `GitHubMetadata` component to display commit information:

```tsx
import GitHubMetadata from "@/components/page-metadata/github-metadata";

<GitHubMetadata 
  owner="tinacms" 
  repo="tina-docs" 
  path="content/docs/index.mdx" 
/>
```

## Implementation Details

- Fetches commit data from the GitHub REST API v3
- For specific files, retrieves the complete commit history to find the first commit
- Caches are handled by Next.js automatic caching mechanisms
- Uses `NextResponse.json()` for proper Content-Type headers
