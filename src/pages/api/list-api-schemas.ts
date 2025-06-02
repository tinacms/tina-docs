import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const schemaDir = path.join(process.cwd(), "content/apiSchema");

    // Check if directory exists
    if (!fs.existsSync(schemaDir)) {
      return res.status(200).json({ schemas: [] });
    }

    // Read all JSON files in the directory
    const files = fs
      .readdirSync(schemaDir)
      .filter((file) => file.endsWith(".json"));

    const schemas = files.map((file) => ({
      id: file,
      filename: file,
      relativePath: file,
      displayName: file.replace(".json", ""),
    }));

    res.status(200).json({ schemas });
  } catch (error) {
    console.error("Error reading API schemas:", error);
    res.status(500).json({ error: "Failed to read API schemas" });
  }
}
