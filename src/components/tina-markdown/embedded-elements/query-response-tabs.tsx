import { Prism } from "@/src/components/styles/prism";
import { useState } from "react";

export const QueryResponseTabs = ({ ...props }) => {
  const [isQuery, setIsQuery] = useState(!props.preselectResponse);

  const buttonStyling =
    "flex justify-center relative leading-tight text-white mx-6 pt-[12px] pb-[10px] text-base font-medium transition duration-150 ease-out rounded-t-3xl flex items-center gap-1 font-tuner whitespace-nowrap px-2";
  const activeButtonStyling =
    " hover:-translate-y-px active:translate-y-px hover:-translate-x-px active:translate-x-px hover:text-gray-50 opacity-50 hover:opacity-100";
  const overlay = (
    <div
      className="w-full grow rounded-md"
      style={{
        backgroundColor: "rgb(1, 22, 39)",
      }}
    />
  );
  const underlineStyling =
    "transition-[width] absolute h-1 bottom-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg";
  const containerStyling =
    "w-full flex col-start-1 row-start-1 overflow-x-scroll flex-col";

  return (
    <div className="mb-1">
      <div
        className="relative top-3 z-10 flex w-full rounded-t-md border-b border-b-orange-400/30 py-0 pt-1"
        style={{
          backgroundColor: "rgb(1, 22, 39)",
        }}
      >
        <button
          type="button"
          onClick={() => setIsQuery(true)}
          className={buttonStyling + (isQuery ? "" : activeButtonStyling)}
          disabled={isQuery}
        >
          Query
          <div className={underlineStyling + (isQuery ? " w-full" : " w-0")} />
        </button>
        <button
          type="button"
          onClick={() => setIsQuery(false)}
          className={buttonStyling + (isQuery ? activeButtonStyling : "")}
          disabled={!isQuery}
        >
          Response
          <div className={underlineStyling + (isQuery ? " w-0" : " w-full")} />
        </button>
      </div>
      <div className="grid h-fit w-full grid-cols-1">
        <div
          className={`${containerStyling} rounded-b-xl`}
          style={{
            zIndex: isQuery ? 5 : 1,
          }}
        >
          {/* 
                    TECH DEBT: the replaceAll is a hack to get around TinaCMS limitations with nested rich-text.
                    TODO (ignore for now) - remove as per https://github.com/tinacms/tina.io/issues/2047 
                */}
          <Prism
            value={props.query?.replaceAll("#", " ") || ""}
            lang={"graphql"}
            theme="nightOwl"
          />
          {overlay}
        </div>
        <div
          className={`${containerStyling} rounded-b-xl`}
          style={{
            zIndex: isQuery ? 1 : 5,
          }}
        >
          {/*
                    TECH DEBT: the replaceAll is a hack to get around TinaCMS limitations with nested rich-text.
                    TODO (ignore for now) - remove as per https://github.com/tinacms/tina.io/issues/2047 
                 */}
          <Prism
            value={props.response?.replaceAll("#", " ") || ""}
            lang={"json"}
            theme="nightOwl"
          />
          {overlay}
        </div>
      </div>
    </div>
  );
};
