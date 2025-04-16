import {
  Highlight,
  type Language,
  type RenderProps,
  Prism as rootPrism,
  themes,
} from "prism-react-renderer";
import React from "react";

(typeof global !== "undefined" ? global : window).Prism = rootPrism;

require("prismjs/components/prism-bash");
require("prismjs/components/prism-diff");
require("prismjs/components/prism-css");
require("prismjs/components/prism-json");

export const Prism = (props: {
  value: string;
  lang?: Language;
  theme?: keyof typeof themes;
}) => {
  const language = props.lang || "bash";

  const codeBlock = ({
    className,
    style,
    tokens,
    getLineProps,
    getTokenProps,
  }: RenderProps) => (
    <pre
      className={`${className} p-3`}
      style={{
        ...style,
        width: "100%",
        border: "none",
        marginBottom: 0,
        borderRadius: "12px",
      }}
    >
      {tokens.map((line, i) => {
        const { key: lineKey, ...lineProps } = getLineProps({
          line,
          key: i,
        });
        return (
          <div key={`prism-line-${lineKey}`} {...lineProps}>
            {line.map((token, key) => {
              const { key: tokenKey, ...tokenProps } = getTokenProps({
                token,
                key,
              });
              return <span key={`prism-token-${tokenKey}`} {...tokenProps} />;
            })}
          </div>
        );
      })}
    </pre>
  );

  return (
    <Highlight
      theme={themes[props.theme || "github"]}
      code={props.value}
      language={language}
      children={codeBlock}
    />
  );
};
