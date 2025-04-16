const createTocCopy = async (versionNumber: string) => {
  try {
    const response = await fetch("/api/versioning", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        versionNumber,
        operation: "createToc",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create TOC copy");
    }
  } catch (error) {
    console.error("Error creating TOC copy:", error);
    throw error;
  }
};

//Creating TOC copy
export default async function createToc(versionNumber: string) {
  await createTocCopy(versionNumber);
}
