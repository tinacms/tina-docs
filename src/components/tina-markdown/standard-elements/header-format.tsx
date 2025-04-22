import { LinkIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect } from "react";
import { getDocId } from "../../../utils/docs/getDocsIds";

export default function HeaderFormat({
  children,
  level,
}: {
  children?: React.ReactNode;
  level: number;
}) {
  const HeadingTag = `h${level}` as any;
  const id = getDocId(
    React.isValidElement(children) && children.props?.content
      ? children.props.content.map((content: any) => content.text).join("")
      : typeof children === "string"
      ? children
      : ""
  );

  const linkHref = `#${id}`;

  const styles = {
    1: "tina-gradient bg-clip-text text-transparent text-4xl !mt-16 mb-4",
    2: "tina-gradient bg-clip-text text-transparent text-3xl !mt-12 mb-2",
    3: "bg-gradient-to-br from-blue-800 via-blue-900 to-blue-100 bg-clip-text text-transparent text-xl font-medium !mt-8 mb-2 !important",
    4: "tina-gradient bg-clip-text text-transparent text-xl font-medium !mt-2 mb-2",
    5: "tina-gradient bg-clip-text text-transparent text-lg font-medium !mt-2 mb-1",
    6: "text-gray-500 text-base font-normal mt-2 mb-1",
  };

  const linkStyle = {
    1: "text-orange-500 size-8",
    2: "text-orange-500 size-8",
    3: "text-blue-900 size-6",
    4: "text-orange-500 size-6",
    5: "text-orange-500 size-4",
    6: "text-gray-500 size-4",
  };

  const handleHeaderClick = (event) => {
    event.preventDefault();
    scrollToElement(id);
    window.history.pushState(null, "", linkHref);
  };

  const scrollToElement = useCallback((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const offset = 130; //offset in pixels
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      scrollToElement(hash);
    }
    //this is used for when you get sent a link with a hash (i.e link to a header)
  }, [scrollToElement]);

  return (
    <HeadingTag
      id={id}
      className={`${styles[level]} group relative cursor-pointer`}
    >
      <a
        href={linkHref}
        className="inline-block no-underline"
        onClick={handleHeaderClick}
      >
        {" "}
        {children}
        <LinkIcon
          className={`${linkStyle[level]} group-hover:animate-wiggle absolute ml-1 opacity-0 transition-opacity duration-200 group-hover:opacity-80`}
          style={{
            display: "inline-block",
            marginTop: "0.25rem",
          }}
        />
      </a>
    </HeadingTag>
  );
}
