import type { Metadata } from "next";
import { formatExcerpt } from "../docs";
import { envUrl } from "../env-url";
import { DEFAULT_SEO } from "./defaultSeo";

export const getSeo = (data: any): Metadata => {
  const excerpt = formatExcerpt(data.docs.body, 140);

  const SEO = {
    title: data.docs.seo?.title || DEFAULT_SEO.title,
    description:
      data.docs.seo?.description || `${excerpt} || ${DEFAULT_SEO.description}`,
    alternates: {
      canonical: envUrl(data.docs.seo?.canonicalUrl),
    },
    openGraph: {
      title: data.docs.title || DEFAULT_SEO.title,
      url: envUrl(data.docs.seo?.canonicalUrl),
      description:
        data.docs.seo?.description ||
        `${excerpt} || ${DEFAULT_SEO.description}`,
      images: [
        {
          ...DEFAULT_SEO.openGraph?.images?.[0],
          url:
            data.docs.seo?.ogImage ||
            envUrl(DEFAULT_SEO.openGraph?.images?.[0]?.url),
        },
      ],
    },
  };

  return {
    ...DEFAULT_SEO,
    ...SEO,
  };
};
