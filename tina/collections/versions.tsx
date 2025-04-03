import React, { useState, useEffect, useCallback } from "react";
import client from "../__generated__/client";
import { useCMS } from "tinacms";
import { wrapFieldsWithMeta } from "tinacms";
import { BaseTextField } from "tinacms";
import { createDocs } from "../../utils/versioning/createDocsCopy";
import { createToc } from "../../utils/versioning/createTocCopy";
import formButtonStyling from "../../components/styles/cmsStyling/buttonStyling";

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

          //UI states
          const [isLoading, setIsLoading] = useState(false);
          const [error, setError] = useState(null);
          const [disabled, setDisabled] = useState(false);
          const [showModal, setShowModal] = useState(false);
          const [showSuccessModal, setShowSuccessModal] = useState(false);

          //Form states and control
          const [versionNumber, setVersionNumber] = useState(null);
          const cms = useCMS();
          const { form, input } = props;

          //Validation steps
          const checkExistingVersion = useCallback(
            async (versionNumber: string) => {
              if (input.value) {
                setError("You have already created this version.");
                return;
              }
              if (form.getFieldState("filename")?.value) {
                setError("Save this file before creating a version.");
                return;
              }
              if (!versionNumber) {
                setError("Version number is required");
                return;
              }
              if (versionNumber.includes(" ")) {
                setError("Version number cannot contain spaces");
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
                setError("Version with this id already exists");
              } catch (err) {
                setDisabled(false);
                setError(null);
              } finally {
                if (error) {
                  setDisabled(true);
                }
              }
            },
            [form, input, error]
          );

          //Controlling when to run validation
          useEffect(() => {
            setVersionNumber(form.getFieldState("versionNumber")?.value);
            checkExistingVersion(versionNumber);
            const unsubscribe = form.subscribe(
              ({ values }) => {
                setVersionNumber(values.versionNumber);
                checkExistingVersion(values.versionNumber);
              },
              { values: true }
            );
            return () => unsubscribe();
          }, [form, checkExistingVersion, versionNumber]);


          //Creating the version
          const createVersion = async () => {
            const versionNumber = form.getFieldState("versionNumber")?.value;
            if (!versionNumber) {
              setError("Version number is required");
              return;
            }
            setIsLoading(true);
            try {
              await createDocs(versionNumber);
              await createToc(versionNumber);
              //state management
              setShowModal(false);
              setShowSuccessModal(true);
              setError(null);
              setDisabled(true);
              input.onChange(true);
              //force-saving the form to ensure correct validation
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
                className={formButtonStyling}
              >
                Create Version
              </button>
              {error && (
                <p className="text-red-900/80 font-sans text-xs mt-2">💡 {error}</p>
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
                        className={formButtonStyling}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createVersion}
                        className={`${formButtonStyling} ${
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
                        className={formButtonStyling}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        },
      },
    },
    {
      name: "tip",
      label: "Tip",
      type: "boolean",
      ui: {
        component: () => { 
          return (
            <>
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
            </>
          );
        },
      },
    },
  ],
};
