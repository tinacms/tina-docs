import { IoMdInformationCircle } from "react-icons/io";
import { IoMdWarning } from "react-icons/io";
import { LuChevronsLeftRight } from "react-icons/lu";
import { MdLightbulb } from "react-icons/md";
import { MdLock } from "react-icons/md";
import { MdOutlineCheck } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";
import { MarkdownComponentMapping } from "../markdown-component-mapping";

type CalloutVariant =
  | "warning"
  | "info"
  | "success"
  | "error"
  | "idea"
  | "lock"
  | "api";

const variants = {
  warning: "border-x-amber-500",
  info: "border-x-brand-secondary",
  success: "border-x-green-600",
  error: "border-x-red-500",
  idea: "border-x-brand-tertiary-hover",
  lock: "border-x-neutral-text-secondary",
  api: "border-x-brand-primary",
} as const;

const icons = {
  warning: IoMdWarning,
  info: IoMdInformationCircle,
  success: MdOutlineCheck,
  error: RxCross2,
  idea: MdLightbulb,
  lock: MdLock,
  api: LuChevronsLeftRight,
} as const;

const iconColors = {
  warning: "text-amber-500",
  info: "text-brand-secondary",
  success: "text-green-600",
  error: "text-red-500",
  idea: "text-brand-tertiary-hover",
  lock: "text-neutral-text-secondary",
  api: "text-brand-primary",
} as const;

interface CalloutProps {
  body?: TinaMarkdownContent;
  variant?: CalloutVariant;
  text?: any;
}

const Callout = (props) => {
  const { body, variant = "warning", text }: CalloutProps = props;
  const Icon = icons[variant] || icons.info;
  const variantClass = variants[variant] || variants.info;
  const iconColorClass = iconColors[variant] || iconColors.info;

  return (
    <blockquote
      className={`relative overflow-hidden rounded-lg bg-neutral-background-secondary border-l-4 my-4 shadow-sm ${variantClass} `}
    >
      <div className="flex items-start gap-3 px-4">
        <div
          className="relative top-5 left-1"
          data-tina-field={tinaField(props, "variant")}
        >
          <Icon className={`${iconColorClass}`} size={20} />
        </div>
        <div
          className={`leading-6 text-neutral-text font-light py-2 ${
            text ? "my-2.5" : ""
          }`}
          data-tina-field={tinaField(props, "body")}
        >
          <TinaMarkdown
            content={
              (body as TinaMarkdownContent) || (text as TinaMarkdownContent)
            }
            components={MarkdownComponentMapping}
          />
        </div>
      </div>
    </blockquote>
  );
};

export default Callout;
