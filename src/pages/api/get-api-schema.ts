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

  const { filename } = req.query;

  if (!filename || typeof filename !== "string") {
    return res.status(400).json({ error: "Filename is required" });
  }

  try {
    const schemaPath = path.join(process.cwd(), "content/apiSchema", filename);

    // Security check - ensure file is in the correct directory
    if (!schemaPath.startsWith(path.join(process.cwd(), "content/apiSchema"))) {
      return res.status(400).json({ error: "Invalid file path" });
    }

    // Check if file exists
    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json({ error: "Schema file not found" });
    }

    // Read and parse the JSON file
    const fileContent = fs.readFileSync(schemaPath, "utf8");
    const parsedFile = JSON.parse(fileContent);

    // The actual API schema is stored as a string in the apiSchema property
    // We need to parse it again to get the actual OpenAPI spec
    let apiSchema;
    if (parsedFile.apiSchema && typeof parsedFile.apiSchema === "string") {
      apiSchema = JSON.parse(parsedFile.apiSchema);
    } else {
      // If it's already an object, use it directly
      apiSchema = parsedFile.apiSchema || parsedFile;
    }

    res.status(200).json({ apiSchema });
  } catch (error) {
    console.error("Error reading API schema:", error);
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: "Invalid JSON format" });
    } else {
      res.status(500).json({ error: "Failed to read API schema" });
    }
  }
}
