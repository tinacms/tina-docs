import { client } from "@/tina/__generated__/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let page = await client.queries.apiSchemaConnection();
    const edges = [...(page.data.apiSchemaConnection.edges ?? [])];

    while (page.data.apiSchemaConnection.pageInfo.hasNextPage) {
      page = await client.queries.apiSchemaConnection({
        after: page.data.apiSchemaConnection.pageInfo.endCursor,
      });
      edges.push(...(page.data.apiSchemaConnection.edges ?? []));
    }

    const schemas = edges.flatMap((edge) =>
      edge?.node
        ? [
            {
              id: edge.node._sys.filename,
              filename: edge.node._sys.relativePath,
              displayName: edge.node._sys.filename,
              apiSchema: edge.node.apiSchema,
            },
          ]
        : []
    );

    return NextResponse.json({ schemas });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read API schemas" },
      { status: 500 }
    );
  }
}
