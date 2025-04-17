import ErrorWrapper from "./error-wrapper";
import client from "@/tina/__generated__/client";

export default async function NotFound() {
  const { data } = await client.queries.globalSiteConfiguration({
    relativePath: "global-site-configuration.json",
  });
  const errorConfig = data.globalSiteConfiguration;
  return (
    <ErrorWrapper description="We couldn't find what you were looking for." errorConfig={errorConfig} />
  );
}
