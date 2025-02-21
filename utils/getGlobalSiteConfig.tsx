import client from "../tina/__generated__/client";

export default async function getGlobalSiteConfig(){
    const globalSiteConfig = await client.queries.globalSiteConfiguration( { relativePath: 'global-config.md'});
    return globalSiteConfig.data.globalSiteConfiguration;
}