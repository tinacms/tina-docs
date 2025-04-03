import React, { useState, useEffect, useCallback } from "react";
import client from "../__generated__/client";
import { useCMS } from "tinacms";
import { wrapFieldsWithMeta } from "tinacms";
import { BaseTextField } from "tinacms";
import { notFound } from "next/navigation";

const shadcnButtonStyling =
  "text-gray-700 h-10 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground";

export const versionsCollection = {
  name: "versions",
  label: "Versions",
  path: "content/versions",
  format: "json",
  ui: {
    filename: {
      slugify: (values) => {
        return values.versionNumber;
      },
    },
  },
  fields: [
    {
      name: "versionNumber",
      label: "Version Number",
      type: "string",
      ui: {
        component: wrapFieldsWithMeta(({ input, form }) => {
          const field = <BaseTextField {...input} />;
          return form.getFieldState("createField")?.value ? (
            <div className="opacity-60 cursor-not-allowed">
              <div className="pointer-events-none">{field}</div>
            </div>
          ) : (
            field
          );
        }),
      },
      description:
        "This is the value that will be used to save the version behind the scenes. Once generated, this value should not be changed.",
    },
    {
      name: "versionLabel",
      label: "Version Label",
      type: "string",
    },
    {
      name: "createField",
      label: "Create Field",
      type: "boolean",
      ui: {
        component: function CreateVersionField(props) {
          const [isLoading, setIsLoading] = useState(false);
          const [error, setError] = useState(null);
          const [disabled, setDisabled] = useState(false);
          const [showModal, setShowModal] = useState(false);
          const [showSuccessModal, setShowSuccessModal] = useState(false);
          const [versionNumber, setVersionNumber] = useState(null);
          const cms = useCMS();
          const { form, input } = props;

          //Validating the version number
          const checkExistingVersion = useCallback(
            async (versionNumber: string) => {
              if (input.value) {
                setDisabled(true);
                setError("You have already created this version.");
                return;
              }
              if (form.getFieldState("filename")?.value) {
                setDisabled(true);
                setError("Save this file before creating a version.");
                return;
              }
              if (!versionNumber) {
                setError("Version number is required");
                setDisabled(true);
                return;
              }
              if (versionNumber.includes(" ")) {
                setError("Version number cannot contain spaces");
                setDisabled(true);
                return;
              }
              try {
                await client.queries.docs({
                  relativePath:
                    "_versions/" + versionNumber + "/_version-index.json",
                });
                await client.queries.docsTableOfContents({
                  relativePath:
                    "_versions/" + versionNumber + "/_version-index.json",
                });
                setDisabled(true);
                setError("Version with this id already exists");
              } catch (err) {
                setDisabled(false);
                setError(null);
              }
            },
            [form, input]
          );

          useEffect(() => {
            setVersionNumber(form.getFieldState("versionNumber")?.value);
            checkExistingVersion(versionNumber);
            console.log("initial check", versionNumber);
            const unsubscribe = form.subscribe(
              ({ values }) => {
                setVersionNumber(values.versionNumber);
                checkExistingVersion(values.versionNumber);
              },
              { values: true }
            );
            return () => unsubscribe();
          }, [form, checkExistingVersion, versionNumber]);

          const addSubpathToSlug = (slug: string) => {
            return slug.replace(
              /^(.+?\/docs\/)/,
              `$1_versions/${versionNumber}/`
            );
          };

          // Recursive helper for formatting nested TOC items for the mutation
          const formatTocItemsRecursive = (tocItemsNode: any): any => {
            // Input is a node with { title, items } from the query result (e.g., DocsTableOfContentsSupermenuGroupItemsItems)
            // Output needs to match the corresponding Mutation structure (e.g., DocsTableOfContentsSupermenuGroupItemsItemsMutation)
            return {
              title: tocItemsNode.title,
              items:
                tocItemsNode.items
                  ?.map((item: any) => {
                    // item is the next level down in the query structure union
                    if (!item) return null;
                    // Check if it's an Item type (leaf node in this branch) - Ensure slug and id exist
                    if (item.slug && typeof item.slug.id === "string") {
                      // Return the { item: ... } structure for the Mutation union
                      return {
                        item: {
                          title: item.title,
                          slug: addSubpathToSlug(item.slug.id),
                        },
                      };
                    }
                    // Check if it's an Items type (node with children)
                    else if (item.items) {
                      // Return the { items: ... } structure for the Mutation union, calling recursively
                      return {
                        items: formatTocItemsRecursive(item),
                      };
                    }
                    console.warn(
                      "Skipping unexpected TOC item structure during recursion:",
                      item
                    );
                    return null;
                  })
                  .filter(Boolean) || [], // Filter out nulls from skipped items
            };
          };

          const getAllQuery = async (queryName: string) => {
            let hasNextPage = true;
            let allArray: any[] = [];
            let after: string | null = null;

            while (hasNextPage) {
              try {
                const data = await client.queries[queryName]({ after });

                const edges = data?.data?.[queryName]?.edges || [];
                const pageInfo = data?.data?.[queryName]?.pageInfo || {
                  hasNextPage: false,
                  endCursor: null,
                };

                allArray = allArray.concat(edges);

                hasNextPage = pageInfo.hasNextPage;
                after = pageInfo.endCursor;
              } catch (error) {
                console.error("Error during static params generation:", error);
                notFound();
              }
            }
            return allArray;
          };

          //Creating the version
          const createVersion = async () => {
            const versionNumber = form.getFieldState("versionNumber")?.value;
            if (!versionNumber) {
              setError("Version number is required");
              return;
            }
            setIsLoading(true);
            try {
              const docsRaw = await getAllQuery("docsConnection");
              const docs = docsRaw.filter(
                (edge) => !edge?.node?._sys.breadcrumbs.includes("_versions")
              );
              if (!docs) return;
              //This is run synchronously to ensure the docs are created before the toc, which uses the new docs as reference
              for (const doc of docs) {
                let docCreated = false;
                const docPath =
                  "_versions/" +
                  versionNumber +
                  "/" +
                  doc?.node?._sys.breadcrumbs.join("/") +
                  ".mdx";
                while (!docCreated) {
                  try {
                    await client.queries.addVersionDocFiles({
                      relativePath: docPath,
                    });
                    await client.queries.updateVersionDoc({
                      relativePath: docPath,
                      body: doc?.node?.body,
                      title: doc?.node?.title,
                      last_edited: doc?.node?.last_edited,
                      tocIsHidden: doc?.node?.tocIsHidden,
                      next: doc?.node?.next?.id,
                      previous: doc?.node?.previous?.id,
                    });
                    const newDoc = await client.queries.docs({
                      relativePath: docPath,
                    });
                    if (newDoc) {
                      docCreated = true;
                    }
                  } catch (err) {
                    console.log("err", err);
                  }
                }
              }
              //create versioned toc
              const tocRaw = await getAllQuery("docsTableOfContentsConnection");
              const docsToc = tocRaw.filter(
                (edge) => !edge?.node?._sys.breadcrumbs.includes("_versions")
              );
              docsToc &&
                docsToc.forEach(async (doc) => {
                  if (!doc?.node) return; // Skip if node is null/undefined

                  // Format the supermenuGroup for the mutation
                  const formattedSupermenuGroup =
                    doc.node.supermenuGroup
                      ?.map((group: any) => {
                        // group is DocsTableOfContentsSupermenuGroup
                        if (!group) return null;
                        return {
                          title: group.title,
                          items:
                            group.items
                              ?.map((item: any) => {
                                // item is DocsTableOfContentsSupermenuGroupItems union
                                if (!item) return null;
                                // Check if it's an Item type - Ensure slug and id exist
                                if (
                                  item.slug &&
                                  typeof item.slug.id === "string"
                                ) {
                                  // Return the { item: ... } structure for the Mutation union
                                  return {
                                    item: {
                                      title: item.title,
                                      slug: addSubpathToSlug(item.slug.id),
                                    },
                                  };
                                }
                                // Check if it's an Items type
                                else if (item.items) {
                                  // Return the { items: ... } structure for the Mutation union
                                  return {
                                    items: formatTocItemsRecursive(item), // Use the recursive helper
                                  };
                                }
                                console.warn(
                                  "Skipping unexpected top-level TOC item structure:",
                                  item
                                );
                                return null;
                              })
                              .filter(Boolean) || [], // Filter out nulls from skipped items
                        };
                      })
                      .filter(Boolean) || []; // Filter out nulls from skipped groups
                  await client.queries.addVersionToc({
                    relativePath:
                      "_versions/" +
                      versionNumber +
                      "/" +
                      doc?.node?._sys.breadcrumbs.join("/") +
                      ".json",
                  });
                  await client.queries.updateVersionDocToc({
                    relativePath:
                      "_versions/" +
                      versionNumber +
                      "/" +
                      doc?.node?._sys.breadcrumbs.join("/") +
                      ".json",
                    supermenuGroup: formattedSupermenuGroup,
                  });
                });
              //create identifier files
              await client.queries.addVersionToc({
                relativePath:
                  "_versions/" + versionNumber + "/_version-index.json",
              });
              await client.queries.addVersionDocFiles({
                relativePath:
                  "_versions/" + versionNumber + "/_version-index.mdx",
              });
              setShowModal(false);
              setShowSuccessModal(true);
              setError(null);
              setDisabled(true);
              input.onChange(true);
              // Manually submit the form to trigger the version label update
              cms.state.forms[0]?.tinaForm.submit();
            } catch (err) {
              checkExistingVersion(versionNumber);
              if (!error) {
                setError("Failed to create version. Please try again.");
              }
              console.error("Error creating version:", err);
              setShowModal(false);
              setShowSuccessModal(false);
            } finally {
              setIsLoading(false);
            }
          };

          return (
            <div className="my-8">
              <h4 className="font-sans text-xs font-semibold text-gray-700 whitespace-normal">
                ⚙️ Version Autogeneration
              </h4>
              <p className="block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal mb-2">
                This will copy existing documentation content to the{" "}
                <span className="font-mono">
                  content/docs/_versions/
                  {form.getFieldState("versionNumber")?.value}
                </span>{" "}
                and{" "}
                <span className="font-mono">
                  content/docs-toc/_versions/
                  {form.getFieldState("versionNumber")?.value}
                </span>{" "}
                directories.
                <br />
                The version selector will pick up the new version automatically.
              </p>
              <button
                onClick={() => setShowModal(true)}
                disabled={disabled}
                className={shadcnButtonStyling}
              >
                Create Version
              </button>
              {error && (
                <p className="text-red-900/80 font-sans text-xs">💡 {error}</p>
              )}

              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                  <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 text-wrap font-sans">
                    <h3 className="text-lg font-semibold text-gray-700 whitespace-normal">
                      Confirm Version Creation ⚠️
                    </h3>
                    <p className="mb-4 text-red-900 text-sm">
                      Are you sure you want to create version{" "}
                      <span className="font-bold">
                        {form.getFieldState("versionNumber")?.value}
                      </span>
                      ?
                    </p>
                    <p className="mb-4 text-gray-500 text-sm">
                      This will{" "}
                      <span className="font-bold">
                        copy existing documentation content
                      </span>{" "}
                      to the{" "}
                      <span className="font-mono">
                        content/docs/_versions/
                        {form.getFieldState("versionNumber")?.value}
                      </span>{" "}
                      and{" "}
                      <span className="font-mono">
                        content/docs-toc/_versions/
                        {form.getFieldState("versionNumber")?.value}
                      </span>{" "}
                      directories.
                    </p>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className={shadcnButtonStyling}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createVersion}
                        className={`${shadcnButtonStyling} ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Creating...
                          </div>
                        ) : (
                          "Create"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                  <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 text-wrap font-sans">
                    <h3 className="text-lg font-semibold text-gray-700 whitespace-normal">
                      Version Created Successfully! 🎉
                    </h3>
                    <p className="mb-4 text-gray-700 text-sm">
                      Version{" "}
                      <span className="font-bold">
                        {form.getFieldState("versionNumber")?.value}
                      </span>{" "}
                      has been created successfully.
                    </p>
                    <p className="mb-4 text-gray-500 text-sm">
                      The version selector will automatically pick up the new
                      version.
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowSuccessModal(false)}
                        className={shadcnButtonStyling}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <h4 className="font-sans text-xs font-semibold text-gray-700 whitespace-normal mt-8">
                Delete Version
              </h4>
              <p className="block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal mb-2">
                To remove a version:
                <br />
                1. delete the file from this collection, and
                <br />
                2. manually remove the folders from the related{" "}
                <span className="font-mono">
                  content/docs/_versions/
                </span> and{" "}
                <span className="font-mono">content/docs-toc/_versions/</span>{" "}
                sub-directories.
              </p>
              <div className="border-gray-200 border my-8 mr-8 p-4 rounded-md bg-red-50/50 text-wrap">
                <p className="font-sans text-xs font-semibold text-gray-700 whitespace-normal mb-2">
                  ⚠️ Caveats ⚠️
                </p>
                <p className="font-sans text-xs font-light text-gray-400 whitespace-normal">
                  This is one approach to managing versioned documentation,{" "}
                  <span className="font-semibold">
                    which keeps all versioned documentation accessible via
                    TinaCMS.
                  </span>
                  <br />
                  It is not the only approach, and may not be the best approach
                  for your use case.
                  {/* TODO: Add a link to the docs on how to manage versioned documentation. */}
                </p>
              </div>
            </div>
          );
        },
      },
    },
  ],
};
