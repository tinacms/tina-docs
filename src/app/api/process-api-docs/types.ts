export interface EndpointData {
  id: string;
  label: string;
  method: string;
  path: string;
  summary: string;
  description: string;
}

export interface GroupApiData {
  schema: string;
  tag: string;
  endpoints: EndpointData[];
}
