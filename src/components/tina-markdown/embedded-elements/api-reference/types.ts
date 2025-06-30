// Interface for endpoint details
export interface Endpoint {
  path: string;
  method: string;
  summary: string;
  description?: string;
  operationId?: string;
  parameters?: any[];
  responses?: Record<string, any>;
  tags?: string[];
  requestBody?: any;
  security?: any[];
}

// Interface for parsed Swagger/OpenAPI details
export interface SchemaDetails {
  title?: string;
  version?: string;
  endpoints: Endpoint[];
  securityDefinitions?: Record<string, any>;
}

// Props for the SchemaType component
export interface SchemaTypeProps {
  schema: any;
  depth?: number;
  isNested?: boolean;
  name?: string;
  showExampleButton?: boolean;
  onToggleExample?: () => void;
  isErrorSchema?: boolean;
}

// Props for the ChevronIcon component
export interface ChevronIconProps {
  isExpanded: boolean;
}

// Props for the RequestBodyDropdown component
export interface RequestBodyDropdownProps {
  value: "schema" | "example";
  onChange: (v: "schema" | "example") => void;
}

// Props for the ApiReference component
export interface ApiReferenceProps {
  schemaFile?: string;
  [key: string]: any;
}

// Type for response view state
export type ResponseViewState = Record<string, "schema" | "example">;

// Type for expanded responses state
export type ExpandedResponsesState = Map<string, boolean>;
