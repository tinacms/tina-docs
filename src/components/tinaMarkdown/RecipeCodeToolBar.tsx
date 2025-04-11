import { MdOutlineContentCopy } from "react-icons/md";

export const CodeToolbar = ({
  lang,
  onCopy,
  tooltipVisible,
}: {
  lang?: string;
  onCopy: () => void;
  tooltipVisible: boolean;
}) => (
  <div className="code-toolbar flex items-center justify-between bg-gray-800 px-4 py-2 text-sm font-semibold text-white lg:rounded-t-xl">
    <span className="font-tuner">{lang || "Unknown"}</span>
    <div className="relative ml-4 flex items-center space-x-4 overflow-visible">
      <button
        onClick={onCopy}
        className={`relative flex items-center space-x-1 rounded-md  bg-gray-800 px-2 py-1 text-sm transition-colors duration-200 ${
          tooltipVisible
            ? "ml-1 rounded-md bg-gray-700 text-white"
            : "text-white hover:bg-gray-700"
        }`}
      >
        {!tooltipVisible && <MdOutlineContentCopy className="size-4" />}
        <span>{!tooltipVisible ? "Copy" : "Copied!"}</span>
      </button>
    </div>
  </div>
);
