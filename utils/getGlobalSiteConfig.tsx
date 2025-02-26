import client from "../tina/__generated__/client";

export default async function getGlobalSiteConfig(){
    const globalSiteConfig = await client.queries.globalSiteConfiguration( { relativePath: 'global-config.md'}, {fetchOptions: {next: {revalidate: 10}}});
    return globalSiteConfig.data.globalSiteConfiguration;
}

export async function getDocsBodyStyling(){
    const globalSiteConfig = await getGlobalSiteConfig();
    return globalSiteConfig?.siteColors?.docsBodyStyling;
}