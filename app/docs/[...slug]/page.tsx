import fg from 'fast-glob';
import { notFound } from 'next/navigation';
import client from '../../../tina/__generated__/client';
import DocumentPageClient from './DocumentPageClient';
import getTableOfContents from '../../../utils/docs/getPageTableOfContents';
import { getDocsNav } from '../../../utils/docs/getDocumentNavigation';

//Placeholder for SEO

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
