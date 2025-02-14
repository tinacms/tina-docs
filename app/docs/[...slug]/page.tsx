import fg from 'fast-glob';
import { notFound } from 'next/navigation';
import client from '../../../tina/__generated__/client';

//Placeholder for SEO

export async function generateStaticParams() {
  try {
    const contentDir = './content/docs/';
    const files = await fg(`${contentDir}**/*.mdx`);
    return files
      .filter((file) => !file.endsWith('index.mdx'))
      .map((file) => {
        const path = file.substring(contentDir.length, file.length - 5); // Remove "./content/docs/" and ".mdx"
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
    const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });

    return <div>{JSON.stringify(data, null, 2)}</div>;
  } catch (e) {
    return notFound();
  }
}
