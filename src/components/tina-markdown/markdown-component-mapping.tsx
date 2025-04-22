import type { Components } from "tinacms/dist/rich-text";
import { CardGrid } from "../blocks/CardGrid";
import Accordion from "./embedded-elements/accordion";
import ApiReference from "./embedded-elements/api-reference";
import Callout from "./embedded-elements/callout";
import { QueryResponseTabs } from "./embedded-elements/query-response-tabs";
import RecipeBlock from "./embedded-elements/recipe";
import ScrollShowcase from "./embedded-elements/scroll-showcase";
import Youtube from "./embedded-elements/youtube";
import { CodeBlock } from "./standard-elements/code-block";
import HeaderFormat from "./standard-elements/header-format";
import Image from "./standard-elements/image";
import MermaidElement from "./standard-elements/mermaid-diagram";
import Table from "./standard-elements/table";

type ComponentMapping = {
  Youtube: { embedSrc: string; caption?: string; minutes?: string };
  QueryResponseTabs: {
    query: string;
    response: string;
    preselectResponse: boolean;
    customQueryName?: string;
    customResponseName?: string;
  };
  ApiReference: {
    title: string;
    property: {
      groupName: string;
      name: string;
      description: string;
      type: string;
      default: string;
      required: boolean;
    }[];
  };
  WarningCallout: { body: string };
  Accordion: { docText: string; image: string; heading?: string };
  RecipeBlock: {
    title?: string;
    description?: string;
    codeblock?: any;
    instruction?: {
      header?: string;
      itemDescription?: string;
      codeLineStart?: number;
      codeLineEnd?: number;
    }[];
  };
  ScrollShowcase: {
    showcaseItems: {
      image: string;
      title: string;
      useAsSubsection: boolean;
      content: string;
    }[];
  };
  CardGrid: {
    cards: {
      title: string;
      description: string;
      link: string;
      linkText: string;
    }[];
  };
  code_block: {
    value: string;
    lang: string;
    children: string;
  };
};

export const MarkdownComponentMapping: Components<ComponentMapping> = {
  // Our embeds we can inject via MDX
  ScrollShowcase: (props) => <ScrollShowcase {...props} />,
  CardGrid: (props) => <CardGrid {...props} />,
  RecipeBlock: (props) => <RecipeBlock {...props} />,
  Accordion: (props) => <Accordion {...props} />,
  ApiReference: (props) => <ApiReference {...props} />,
  Youtube: (props) => <Youtube {...props} />,
  QueryResponseTabs: (props) => <QueryResponseTabs {...props} />,
  WarningCallout: (props) => <Callout {...props} variant="warning" />,

  // Our default markdown components
  h1: (props) => <HeaderFormat level={1} {...props} />,
  h2: (props) => <HeaderFormat level={2} {...props} />,
  h3: (props) => <HeaderFormat level={3} {...props} />,
  h4: (props) => <HeaderFormat level={4} {...props} />,
  h5: (props) => <HeaderFormat level={5} {...props} />,
  h6: (props) => <HeaderFormat level={6} {...props} />,
  ul: (props) => <ul className="my-4 ml-2 list-disc" {...props} />,
  ol: (props) => <ol className="my-4 ml-2 list-decimal" {...props} />,
  li: (props) => <li className="mb-2 ml-8" {...props} />,
  p: (props) => <p className="mb-2" {...props} />,
  block_quote: (props) => <Callout body={props?.children} variant="info" />,
  a: (props) => (
    <a
      href={props?.url}
      {...props}
      className="underline opacity-80 transition-all duration-200 ease-out hover:text-orange-500"
    />
  ),
  code: (props) => (
    <code
      className="rounded border-y-stone-600 bg-white/50 px-1 py-0.5 text-orange-500"
      {...props}
    />
  ),
  mermaid: (props) => <MermaidElement {...props} />,
  img: (props) => <Image {...props} />,
  table: (props) => <Table {...props} />,
  code_block: (props) => <CodeBlock {...props} />,
};

export default MarkdownComponentMapping;
