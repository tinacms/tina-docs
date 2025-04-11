import { getExcerpt } from "../docs/getExcerpt";
import { defaultSeo } from "./defaultSeo";

export const getSeo = (data: any) => {
  const excerpt = getExcerpt(data.docs.body, 140);
  const SEO = {
    title: `${data.docs.seo?.title || data.docs.title} | ${defaultSeo.title}`,
    description:
      data.docs.seo?.description || `${excerpt} || ${defaultSeo.description}`,
    openGraph: {
      title: data.docs.title || defaultSeo.title,
      description:
        data.docs.seo?.description || `${excerpt} || ${defaultSeo.description}`,
    },
  };

  return {
    ...defaultSeo,
    ...SEO,
  };
};
