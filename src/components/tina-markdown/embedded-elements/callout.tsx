import { TinaMarkdown, TinaMarkdownContent } from "tinacms/dist/rich-text";
import { MarkdownComponentMapping } from "../markdown-component-mapping";
import { MdLightbulb } from "react-icons/md";
import { IoMdInformationCircle } from "react-icons/io";
import { IoMdWarning } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { MdLock } from "react-icons/md";
import { MdOutlineCheck } from "react-icons/md";
import { LuChevronsLeftRight } from "react-icons/lu";

const variants = {
  warning: "border-x-yellow-400",
  info: "border-x-blue-400",
  success: "border-x-green-400",
  error: "border-x-red-400",
  idea: "border-x-teal-400",
  lock: "border-x-gray-400",
  api: "border-x-orange-400"
};

const icons = {
  warning: IoMdWarning,
  info: IoMdInformationCircle,
  success: MdOutlineCheck,
  error: RxCross2,
  idea: MdLightbulb,
  lock: MdLock,
  api: LuChevronsLeftRight
};

const iconColors = {
  warning: "text-yellow-400",
  info: "text-blue-400",
  success: "text-green-400",
  error: "text-red-400",
  idea: "text-teal-400",
  lock: "text-gray-400",
  api: "text-orange-400"
};

const Callout = ({ body, variant = "warning" }) => {
  const Icon = icons[variant] || icons.info;
  const variantClass = variants[variant] || variants.info;
  const iconColorClass = iconColors[variant] || iconColors.info;

  return (
    <blockquote
      style={{
        backgroundColor: "var(--color-white)",
      }}
      className={`relative my-4 overflow-hidden rounded-lg shadow-sm border-l-4 ${variantClass} pl-4 pr-2 pt-2.5`}
    >
      <div className="flex flex-col items-start gap-1 md:flex-row ">
        <div>
          <Icon
            className={`mx-0 my-2 pb-2 rounded-full ${iconColorClass} px-1.5 md:mx-2 md:my-0`}
            size={36}
          />
        </div>
        <div className="leading-6 text-neutral-700 font-light">
          <TinaMarkdown
            content={body as TinaMarkdownContent}
            components={MarkdownComponentMapping}
          />
        </div>
      </div>
    </blockquote>
  );
};

export default Callout;
