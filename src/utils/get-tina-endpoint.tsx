import { config } from "@/tina/config";

export const getTinaEndpoint = (): string | null => {
  const clientId = config.clientId;
  const branch = config.branch;

  if (!clientId || !branch) {
    return null;
  }

  return `https://content.tinajs.io/1.5/content/${clientId}/github/${branch}`;
};
