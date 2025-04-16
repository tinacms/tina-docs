const createDocsCopy = async (versionNumber: string) => {
  try {
    const response = await fetch("/api/versioning", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        versionNumber,
        operation: "createDocs",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create docs copy");
    }
  } catch (error) {
    console.error("Error creating docs copy:", error);
    throw error;
  }
};

//Creating document copy
export default async function createDocs(versionNumber: string) {
  await createDocsCopy(versionNumber);
}
