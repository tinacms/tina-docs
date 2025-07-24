export const ADD_PENDING_DOCUMENT_MUTATION = `
mutation AddPendingDocument($collection: String!, $relativePath: String!) {
    addPendingDocument(collection: $collection, relativePath: $relativePath) {
        __typename
    }
}
`;

export const UPDATE_DOCS_MUTATION = `
mutation UpdateDocs($relativePath: String!, $params: DocsMutation!) {
    updateDocs(relativePath: $relativePath, params: $params) {
        __typename
        id
        title
    }
}
`;

export const DELETE_DOCUMENT_MUTATION = `
mutation DeleteDocument($collection: String!, $relativePath: String!) {
    deleteDocument(collection: $collection, relativePath: $relativePath) {
        __typename
    }
}
`;

export const GET_DOC_BY_RELATIVE_PATH_QUERY = `
query GetDocByRelativePath($relativePath: String!) {
    docs(relativePath: $relativePath) {
        id
        title
        auto_generated
        seo {
            title
            description
            canonicalUrl
        }
        auto_generated
        last_edited
        body
        _sys {
            filename
            relativePath
        }
    }
}
`;

export const GET_ALL_DOCS_QUERY = `
query GetAllDocs {
    docsConnection {
        edges {
        node {
            id
            _sys {
            filename
            relativePath
            }
        }
        }
    }
}   
`;
