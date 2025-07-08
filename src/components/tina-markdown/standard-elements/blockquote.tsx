import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";
import MarkdownComponentMapping from "../markdown-component-mapping";

const Blockquote = (props) => {
  return (
    <blockquote className="relative overflow-hidden rounded-lg bg-neutral-background-secondary border-l-4 my-4 shadow-sm border-neutral-border">
      <div className="flex items-start gap-3 px-4">
        <div
          className={`leading-6 text-neutral-text font-light py-2 ${
            props.text ? "my-2.5" : ""
          }`}
        >
          {props.children}
        </div>
      </div>
    </blockquote>
  );
};

export default Blockquote;
