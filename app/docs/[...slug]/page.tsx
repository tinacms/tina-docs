import fg from 'fast-glob';
import { notFound } from 'next/navigation';
import client from '../../../tina/__generated__/client';
import DocumentPageClient from './DocumentPageClient';
import getTableOfContents from '../../../utils/navigation/getPageTableOfContents';
import { getDocsNav } from '../../../utils/navigation/getDocumentNavigation';
import { getExcerpt } from '../../../utils/seo/getExcerpt';




export async function generateStaticParams() {
  try {
    const contentDir = './content/docs/';
    const files = await fg(`${contentDir}**/*.mdx`);
    return files
      .filter((file) => !file.endsWith('index.mdx'))
      .map((file) => {
        const path = file.substring(contentDir.length, file.length - 4); // Remove "./content/docs/" and ".mdx"
        return { slug: path.split('/') };
      });
  } catch (error) {
    console.error(error);
    notFound();
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}) {
  const slug = params.slug?.join('/');
  try {
    const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });
    const excerpt = getExcerpt(data.docs.body, 140);

    return {
      title: `${data.docs.seo?.title || data.docs.title} | TinaCMS Docs`,
      description: data.docs.seo?.description || `${excerpt} || TinaCMS Docs`,
      openGraph: {
        title: data.docs.title || 'TinaCMS Docs',
        description: data.docs.seo?.description || `${excerpt} || TinaCMS Docs`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return notFound();
  }
}

export default async function DocsPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  

  try {
   
    const [documentData, docsToCData] = await Promise.all([
      client.queries.docs({ relativePath: `${slug}.mdx` }),
      getDocsNav(),
    ]);

    
    const pageTableOfContents = getTableOfContents(documentData?.data.docs.body);
    

    const props = {
      query: documentData.query,
      variables: documentData.variables,
      data: documentData.data,
      pageTableOfContents,
      documentationData: documentData,
      navigationDocsData: docsToCData,
    };

    return <div> <DocumentPageClient props={props}/></div>
  } catch (e) {
    console.error(e);
    return notFound();
  }
}
