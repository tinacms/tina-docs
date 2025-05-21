import * as React from "react";
import * as dropzone from "react-dropzone";
// import type { FieldProps } from "tinacms/dist/forms";
// Try default import from tinacms
// import FieldProps from "tinacms";

// Fallback: restore the original TinaFieldProps interface if FieldProps cannot be imported
interface TinaFieldProps {
  input: {
    value: string;
    onChange: (value: string) => void;
  };
  field: {
    name: string;
    label?: string;
    description?: string;
  };
}

const { useDropzone } = dropzone;

// Define Swagger-related types
interface SwaggerEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  operationId: string;
  tags: string[];
  parameters: any[];
  responses: Record<string, any>;
  consumes: string[];
  produces: string[];
  security: any[];
}

interface SwaggerInfo {
  title?: string;
  version?: string;
  description?: string;
  [key: string]: any;
}

interface SwaggerParseResult {
  endpoints: SwaggerEndpoint[];
  info: SwaggerInfo | null;
  definitions?: Record<string, any>;
  error: string | null;
}

// Utility function to parse Swagger JSON and extract endpoints
export const parseSwaggerJson = (jsonString: string): SwaggerParseResult => {
  try {
    // Parse the JSON string into an object
    const swagger = JSON.parse(jsonString);

    // Check if it's a valid Swagger/OpenAPI document
    if (!swagger.paths) {
      return {
        endpoints: [],
        info: null,
        error: "Invalid Swagger JSON: Missing paths object",
      };
    }

    // Extract basic API information
    const info = swagger.info || {};

    // Extract endpoints from the paths object
    const endpoints: SwaggerEndpoint[] = [];

    for (const path of Object.keys(swagger.paths)) {
      const pathItem = swagger.paths[path];

      // Process each HTTP method in the path (GET, POST, PUT, DELETE, etc.)
      for (const method of Object.keys(pathItem)) {
        const operation = pathItem[method];

        // Create an endpoint object with relevant information
        const endpoint: SwaggerEndpoint = {
          path,
          method: method.toUpperCase(),
          summary: operation.summary || "",
          description: operation.description || "",
          operationId: operation.operationId || "",
          tags: operation.tags || [],
          parameters: operation.parameters || [],
          responses: operation.responses || {},
          consumes: operation.consumes || [],
          produces: operation.produces || [],
          security: operation.security || [],
        };

        endpoints.push(endpoint);
      }
    }

    return {
      endpoints,
      info,
      definitions: swagger.definitions || {},
      error: null,
    };
  } catch (error) {
    return { endpoints: [], info: null, error: error.message };
  }
};

// SVG icons as React components
const FileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-file"
    {...props}
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

// JSON file icon
const JsonFileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-file-text"
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const FilePlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-file-plus"
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-trash-2"
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// File Preview component
const FilePreview = ({ src }: { src: string }) => {
  const fileName = src.split("/").pop() || src;

  return (
    <div className="max-w-full w-full flex-1 flex justify-start items-center gap-3 p-3 bg-gray-50 rounded shadow-sm">
      <div className="w-12 h-12 bg-white shadow border border-gray-100 rounded flex justify-center flex-none">
        <FileIcon className="w-3/5 h-full text-gray-500" />
      </div>
      <div className="flex-1 overflow-hidden">
        <span className="text-base font-medium block truncate">{fileName}</span>
        <span className="text-sm text-gray-500 block">
          {src.startsWith("http") ? "Uploaded file" : src}
        </span>
      </div>
    </div>
  );
};

// JSON file preview
const JsonFilePreview = ({
  fileName,
  jsonPreview,
}: {
  fileName: string;
  jsonPreview?: string;
}) => {
  return (
    <div className="max-w-full w-full flex-1 flex justify-start items-center gap-3 p-3 bg-gray-50 rounded shadow-sm">
      <div className="w-12 h-12 bg-white shadow border border-gray-100 rounded flex justify-center flex-none">
        <JsonFileIcon className="w-3/5 h-full text-blue-500" />
      </div>
      <div className="flex-1 overflow-hidden">
        <span className="text-base font-medium block truncate">{fileName}</span>
        {jsonPreview && (
          <span className="text-sm text-gray-500 block truncate">
            {jsonPreview}
          </span>
        )}
      </div>
    </div>
  );
};

// Loading indicator
const LoadingIndicator = () => (
  <div className="p-6 w-full flex flex-col justify-center items-center">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
      <div
        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
        style={{ animationDelay: "0.4s" }}
      />
    </div>
  </div>
);

// Delete button
const DeleteFileButton = ({
  onClick,
}: {
  onClick: (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => {
  return (
    <button
      type="button"
      className="flex-none bg-white bg-opacity-80 hover:bg-opacity-100 shadow-sm p-1 rounded-full border border-gray-200"
      onClick={onClick}
    >
      <TrashIcon className="w-5 h-5 text-red-500" />
    </button>
  );
};

// JSON File Upload component
export const JsonFileUploadComponent = ({ input, field }: TinaFieldProps) => {
  const [loading, setLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [jsonPreview, setJsonPreview] = React.useState("");
  const [swaggerData, setSwaggerData] =
    React.useState<SwaggerParseResult | null>(null);

  React.useEffect(() => {
    // Parse existing data if available
    if (input.value && typeof input.value === "string" && input.value.trim()) {
      try {
        const data = parseSwaggerJson(input.value);
        setSwaggerData(data);

        // Show number of endpoints in the preview
        if (data.endpoints?.length > 0) {
          setJsonPreview(
            `Contains ${data.endpoints.length} endpoints. API: ${
              data.info?.title || "Unknown"
            }`
          );
        }
      } catch (error) {
        // Handle error silently
      }
    }
  }, [input.value]);

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setLoading(true);
    try {
      const file = acceptedFiles[0];

      // Only accept JSON files
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const reader = new FileReader();

        reader.onload = () => {
          try {
            const jsonContent = reader.result as string;

            // Parse the Swagger JSON to validate and extract info
            const swaggerData = parseSwaggerJson(jsonContent);
            setSwaggerData(swaggerData);

            if (swaggerData.error) {
              alert(`Error parsing Swagger JSON: ${swaggerData.error}`);
              setLoading(false);
              return;
            }

            // Store the complete JSON content in the input
            input.onChange(jsonContent);
            setFileName(file.name);

            // Create a meaningful preview
            let preview = "";
            if (swaggerData.info?.title) {
              preview = `${swaggerData.info.title} v${
                swaggerData.info.version || "unknown"
              } - `;
            }
            preview += `${swaggerData.endpoints.length} endpoints`;

            setJsonPreview(preview);

            // Log for debugging

            setLoading(false);
          } catch (parseError) {
            try {
              const parseError = new Error("Error handling JSON");
              alert(
                "Error parsing JSON file. Please ensure it is a valid Swagger/OpenAPI JSON."
              );
              setLoading(false);
            } catch (error) {
              setLoading(false);
            }
          }
        };

        reader.onerror = () => {
          setLoading(false);
        };

        reader.readAsText(file); // Read as text for JSON files
      } else {
        alert("Please upload a JSON file only");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleClear = () => {
    input.onChange("");
    setFileName("");
    setJsonPreview("");
    setSwaggerData(null);
  };

  const handleBrowseClick = () => {
    // Trigger file browser
    document.getElementById(`file-upload-${field.name}`)?.click();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/json": [],
      "text/json": [],
    },
    onDrop: handleDrop,
    noClick: true, // We'll handle clicks ourselves
  });

  return (
    <div className="w-full max-w-full">
      {field.label && (
        <h4 className="mb-1 font-medium text-gray-600">{field.label}</h4>
      )}
      {field.description && (
        <p className="mb-2 text-sm text-gray-500">{field.description}</p>
      )}

      <div
        className={`border-2 ${
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-200"
        } border-dashed rounded-md transition-colors duration-200 ease-in-out`}
        {...getRootProps()}
      >
        <input {...getInputProps()} id={`file-upload-${field.name}`} />
        {input.value ? (
          loading ? (
            <LoadingIndicator />
          ) : (
            <div className="relative w-full max-w-full">
              <div className="p-1">
                <div
                  className="w-full focus-within:shadow-outline focus-within:border-blue-500 rounded outline-none overflow-visible cursor-pointer border-none hover:bg-gray-100 transition ease-out duration-100"
                  onClick={handleBrowseClick}
                >
                  <JsonFilePreview
                    fileName={fileName}
                    jsonPreview={jsonPreview}
                  />
                </div>

                {/* Show summary of parsed Swagger data */}
                {swaggerData && swaggerData.endpoints.length > 0 && (
                  <div className="mt-2 p-3 text-sm text-gray-700 bg-gray-50 rounded">
                    <p className="font-semibold">
                      API: {swaggerData.info?.title || "Unknown"}
                    </p>
                    <p>Version: {swaggerData.info?.version || "Unknown"}</p>
                    <p>{swaggerData.endpoints.length} endpoints found</p>
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2">
                <DeleteFileButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              </div>
            </div>
          )
        ) : (
          <button
            type="button"
            className="outline-none relative hover:bg-gray-50 w-full"
            onClick={handleBrowseClick}
          >
            {loading ? (
              <LoadingIndicator />
            ) : (
              <div
                className={`text-center py-6 px-4 ${
                  isDragActive ? "text-blue-500" : "text-gray-500"
                }`}
              >
                <JsonFileIcon className="mx-auto w-10 h-10 mb-2 text-blue-500" />
                <p className="text-base font-medium">
                  {isDragActive
                    ? "Drop the JSON file here"
                    : "Drag and drop a Swagger/OpenAPI JSON file here"}
                </p>
                <p className="text-sm mt-1">
                  or{" "}
                  <span className="text-blue-500 cursor-pointer">browse</span>{" "}
                  to upload
                </p>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
