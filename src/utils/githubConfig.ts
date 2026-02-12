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
}