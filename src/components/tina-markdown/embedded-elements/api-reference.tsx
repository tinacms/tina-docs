
export type ApiReferenceType = {
    endpointName: string;
    description: string;
    type: 'GET' | 'POST' | 'PUT' | 'DELETE';
    pathParameters: {
      parameterName: string;
      parameterDescription: string;
      required: boolean;
      in: 'path' | 'query' | 'body';
      type: 'string' | 'number' | 'boolean' | 'integer';
    }[];
    responses: {
      status: number;
      description: string;
      responseBody: {
        fieldName: string;
        type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
        description: string;
        fields?: {
          fieldName: string;
          type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
          description: string;
        }[];
      }[];
    }[];
  };
  
export default function ApiReference(data: ApiReferenceType) {
    console.log(data);
  return <div>ApiReference</div>;
}
    