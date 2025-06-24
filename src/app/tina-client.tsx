"use client";

import type React from "react";
import { useTina } from "tinacms/dist/react";

// Import TocItem type from utils
type TocItem = {
  type: string;
  text: string;
};

export type UseTinaProps = {
  query: string;
  variables: Record<string, unknown>;
  data: Record<string, unknown>;
  pageTableOfContents?: TocItem[];
  documentationData?: Record<string, unknown>;
};

export type TinaClientProps<T> = {
  props: UseTinaProps & T;
  Component: React.FC<{
    tinaProps: { data: Record<string, unknown> };
    props: {
      query: string;
      variables: Record<string, unknown>;
      data: Record<string, unknown>;
      pageTableOfContents?: TocItem[];
      documentationData?: Record<string, unknown>;
    };
  }>;
};

export function TinaClient<T>({ props, Component }: TinaClientProps<T>) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  return <Component tinaProps={{ data }} props={{ ...props }} />;
}
