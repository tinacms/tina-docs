import React from "react";
import { BaseTextField, wrapFieldsWithMeta } from "tinacms";
import VersionCreator from "../customFields/versionCreator";
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
      name: "createField",
      label: "Create Field",
      type: "boolean",
      ui: {
        component: VersionCreator,
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
