import type { Components, TinaMarkdownContent } from "tinacms/dist/rich-text";
import Accordion, { AccordionBlock } from "./embedded-elements/accordion";
import ApiReference from "./embedded-elements/api-reference";
import Callout from "./embedded-elements/callout";
import { CardGrid } from "./embedded-elements/card-grid";
import { QueryResponseTabs } from "./embedded-elements/query-response-tabs";
import RecipeBlock from "./embedded-elements/recipe";
import { ScrollBasedShowcase } from "./embedded-elements/scroll-showcase";
import Youtube from "./embedded-elements/youtube";
import { CodeBlock } from "./standard-elements/code-block/code-block";
import HeaderFormat from "./standard-elements/header-format";
import { ImageComponent } from "./standard-elements/image";
import MermaidElement from "./standard-elements/mermaid-diagram";
import Table from "./standard-elements/table";
import Steps from "./embedded-elements/steps";

type ComponentMapping = {
  youtube: { embedSrc: string; caption?: string; minutes?: string };
  queryResponseTabs: {
    query: string;
    response: string;
    preselectResponse: boolean;
    customQueryName?: string;
    customResponseName?: string;
  };
  blockquote: {
    children: {
      props: {
        content: TinaMarkdownContent;
      };
    };
  };
  apiReference: {
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
  Callout: { body: TinaMarkdownContent; variant: string };

  accordion: {
    docText: string;
    image: string;
    heading?: string;
    fullWidth?: boolean;
  };
  recipe: {
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
  scrollShowcase: {
    showcaseItems: {
      image: string;
      title: string;
      useAsSubsection: boolean;
      content: string;
    }[];
  };
  cardGrid: {
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
  accordionBlock: {
    accordionItems: {
      docText: string;
      image: string;
      heading?: string;
      fullWidth?: boolean;
    }[];
  };
  steps: {
    stepBlock: {
      description: string;
    }[];
  };
};

type CalloutVariant =
  | "warning"
  | "info"
  | "success"
  | "error"
  | "idea"
  | "lock"
  | "api";

interface CalloutComponentProps {
  variant?: CalloutVariant;
  body?: TinaMarkdownContent;
  text?: any;
}

export const MarkdownComponentMapping: Components<ComponentMapping> = {
  // Our embeds we can inject via MDX
  scrollShowcase: (props) => <ScrollBasedShowcase {...props} />,
  cardGrid: (props) => <CardGrid {...props} />,
  recipe: (props) => <RecipeBlock {...props} />,
  accordion: (props) => <Accordion {...props} />,
  apiReference: (props) => <ApiReference {...props} />,
  youtube: (props) => <Youtube {...props} />,
  queryResponseTabs: (props) => <QueryResponseTabs {...props} />,
  Callout: (props: { body: TinaMarkdownContent; variant: string }) => (
    <Callout {...props} variant={props.variant as CalloutVariant} />
  ),
  // Our default markdown components
  h1: (props) => <HeaderFormat level={1} {...props} />,
  h2: (props) => <HeaderFormat level={2} {...props} />,
  h3: (props) => <HeaderFormat level={3} {...props} />,
  h4: (props) => <HeaderFormat level={4} {...props} />,
  h5: (props) => <HeaderFormat level={5} {...props} />,
  h6: (props) => <HeaderFormat level={6} {...props} />,
  ul: (props) => (
    <ul className="my-4 ml-2 list-disc text-neutral-text" {...props} />
  ),
  ol: (props) => (
    <ol className="my-4 ml-2 list-decimal text-neutral-text" {...props} />
  ),
  li: (props) => <li className="mb-2 ml-8 text-neutral-text" {...props} />,
  p: (props) => <p className="mb-2 font-inter text-neutral-text" {...props} />,
  blockquote: (props) => (
    <Callout text={props.children.props.content} variant="info" />
  ),
  a: (props) => (
    <a
      href={props?.url}
      {...props}
      className="transition-all duration-200 ease-out text-brand-tertiary-text hover:text-brand-tertiary-hover"
    />
  ),
  code: (props) => (
    <code
      className="rounded border-y-neutral-border shadow-lg bg-neutral-border px-1 py-0.5 text-brand-primary"
      {...props}
    />
  ),
  mermaid: (props) => <MermaidElement {...props} />,
  img: (props) => <ImageComponent {...props} />,
  table: (props) => <Table {...props} />,
  code_block: (props) => <CodeBlock {...props} />,
  accordionBlock: (props) => <AccordionBlock {...props} />,
  steps: (props) => <Steps {...props} />,
};

export default MarkdownComponentMapping;
