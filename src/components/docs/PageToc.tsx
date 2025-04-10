"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import styled, { css } from "styled-components";
import { getDocId } from "@/utils/docs/getDocsIds";

interface TocProps {
  tocItems: Array<{ type: string; text: string }>;
  activeids: string[];
}

export const generateMarkdown = (
  tocItems: Array<{ type: string; text: string }>,
) => {
  return tocItems
    .map((item) => {
      const anchor = getDocId(item.text);
      const prefix = item.type === "h3" ? "  " : "";
      return `${prefix}- [${item.text}](#${anchor})`;
    })
    .join("\n");
};

const ToC = ({ tocItems, activeids }: TocProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tocWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = () => setIsOpen(false);
    const allLinks = document.querySelectorAll("a");
    allLinks.forEach((a) => a.addEventListener("click", close));

    return () => {
      allLinks.forEach((a) => a.removeEventListener("click", close));
    };
  }, []);

  useEffect(() => {
    if (tocWrapperRef.current && activeids?.length > 0) {
      const tocList = tocWrapperRef.current;

      const lastActiveId = activeids[activeids.length - 1];
      const activeLink = tocList.querySelector(`a[href="#${lastActiveId}"]`);

      if (activeLink) {
        const activeTop = (activeLink as HTMLElement).offsetTop;
        const activeHeight = (activeLink as HTMLElement).offsetHeight;
        const listHeight = tocList.clientHeight;

        tocList.scrollTo({
          top: activeTop - listHeight / 2 + activeHeight / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeids]);

  if (!tocItems || tocItems.length === 0) {
    return null;
  }

  const tocMarkdown = generateMarkdown(tocItems);

  return (
    <>
      <TocWrapper>
        <TocContent activeids={activeids} isopen={isOpen.toString()}>
          <TocDesktopHeader>Table of Contents</TocDesktopHeader>
          <TocTitleList
            ref={tocWrapperRef}
            // eslint-disable-next-line tailwindcss/no-arbitrary-value
            className="max-h-[70vh] overflow-y-auto p-4 2xl:max-h-[75vh]"
          >
            <ReactMarkdown
              components={{
                ul: ({ children }) => (
                  <ul className="space-y-1 pt-1">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                a: ({ children, ...props }) => {
                  const isActive = activeids?.includes(
                    props.href?.slice(1) || "",
                  ); // Match href with activeIds
                  return (
                    <a
                      {...props}
                      className={`
                        block rounded-md px-2 py-1 transition-colors duration-150 hover:bg-gray-50/75
                        ${
                          isActive
                            ? "font-medium text-orange-500 no-underline"
                            : "text-gray-600 hover:text-orange-500"
                        }`}
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {tocMarkdown}
            </ReactMarkdown>
          </TocTitleList>
        </TocContent>
      </TocWrapper>
    </>
  );
};

export default ToC;
const TocTitleList = styled.div<{ ref: React.RefObject<HTMLDivElement> }>`
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;

  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;

  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
`;
const TocDesktopHeader = styled.span`
  display: none;
  font-size: 1rem;
  color: var(--color-secondary);
  opacity: 0.5;
  background: transparent;
  line-height: 1;
  margin-bottom: 1.125rem;

  @media (min-width: 1200px) {
    display: block;
  }
`;

const TocWrapper = styled.div`
  margin-bottom: -0.375rem;
  flex: 0 0 auto;
  width: 300px; /* fix width */
  word-wrap: break-word; /* break the long word */
  white-space: normal;
  overflow-wrap: break-word; /* suppport Chrome */

  @media (min-width: 1200px) {
    position: sticky;
    top: 8rem;
  }
`;

const TocContent = styled.div<{ isopen: string; activeids: string[] }>`
  display: block;
  width: 100%;
  line-height: 1.25;
  height: auto;
  max-height: 0;
  overflow: hidden;
  transition: all 400ms ease-out;

  ${(props) =>
    props.isopen === "true" &&
    css`
      transition: all 750ms ease-in;
      max-height: 1500px;
    `}

  @media (min-width: 1200px) {
    max-height: none;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  li {
    margin: 0;
    padding: 0.375rem 0;
  }

  ul ul {
    padding-left: 0.75rem;

    li {
      padding: 0.25rem 0;
    }
  }
`;
