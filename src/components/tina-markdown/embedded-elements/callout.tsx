import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import DocsMDXComponentRenderer from "../markdown-component-mapping";

const variants = {
  warning: "border-x-orange-400",
  info: "border-x-teal-400",
  success: "border-x-green-400",
  error: "border-x-red-400",
};

const icons = {
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  error: XCircleIcon,
};

const iconColors = {
  warning: "from-orange-400 to-orange-600",
  info: "from-teal-400 to-teal-600",
  success: "from-green-400 to-green-600",
  error: "from-red-400 to-red-600",
};

const Callout = ({ body, variant }) => {
  const Icon = icons[variant];
  const StyledIcon = (
    <Icon
      className={`mx-0 my-2 rounded-full bg-gradient-to-br ${iconColors[variant]} px-2 pb-1.5 pt-0.5 text-white md:mx-2 md:my-0`}
    />
  );
  return (
    <blockquote
      style={{
        backgroundColor: "var(--color-white)",
      }}
      className={`relative my-4 overflow-hidden rounded-r-lg border-l-4 ${variants[variant]} pb-4 pl-4 pr-2 pt-2 md:py-6`}
    >
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
        <div>{StyledIcon}</div>
        <div className="leading-6">
          <TinaMarkdown
            content={body as any}
            components={DocsMDXComponentRenderer}
          />
        </div>
      </div>
    </blockquote>
  );
};

export default Callout;
