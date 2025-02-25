'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styled, { css } from 'styled-components';
import { getDocId } from '../../utils/docs/getDocsIds';

interface TocProps {
  tocItems: Array<{ type: string; text: string }>;
  activeIds: string[];
}

export const generateMarkdown = (
  tocItems: Array<{ type: string; text: string }>
) => {
  return tocItems
    .map((item) => {
      const anchor = getDocId(item.text);
      const prefix = item.type === 'h3' ? '  ' : '';
      return `${prefix}- [${item.text}](#${anchor})`;
    })
    .join('\n');
};

const ToC = ({ tocItems, activeIds }: TocProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tocWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = () => setIsOpen(false);
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach((a) => a.addEventListener('click', close));

    return () => {
      allLinks.forEach((a) => a.removeEventListener('click', close));
    };
  }, []);

  useEffect(() => {
    if (tocWrapperRef.current && activeIds.length > 0) {
      const tocList = tocWrapperRef.current;

      const lastActiveId = activeIds[activeIds.length - 1];
      const activeLink = tocList.querySelector(`a[href="#${lastActiveId}"]`);

      if (activeLink) {
        const activeTop = (activeLink as HTMLElement).offsetTop;
        const activeHeight = (activeLink as HTMLElement).offsetHeight;
        const listHeight = tocList.clientHeight;

        tocList.scrollTo({
          top: activeTop - listHeight / 2 + activeHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [activeIds]);

  if (!tocItems || tocItems.length === 0) {
    return null;
  }

  const tocMarkdown = generateMarkdown(tocItems);

  return (
    <>
      <TocWrapper>
        <TocContent activeIds={activeIds} isOpen={isOpen}>
          <TocDesktopHeader>Table of Contents</TocDesktopHeader>
          <TocTitleList
            ref={tocWrapperRef}
            className="max-h-[70vh] 2xl:max-h-[75vh] p-4 overflow-y-auto"
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
                  // Ensure we always have a string for the href
                  const hrefText = props.href ? props.href.slice(1) : '';
                  const isActive = activeIds.includes(hrefText);
                  return (
                    <a
                      {...props}
                      className={`
                        block py-1 px-2 rounded-xl hover:bg-gray-50/75 transition-colors duration-150
                        ${
                          isActive
                            ? 'text-orange-500 font-medium no-underline'
                            : 'text-gray-600 hover:text-orange-500'
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

// TODO: Remove styled jsx 
const TocTitleList = styled.div`
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
  width: 300px;
  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;
  @media (min-width: 1200px) {
    position: sticky;
    top: 8rem;
  }
`;

const TocContent = styled.div<{ isOpen: boolean; activeIds: string[] }>`
  display: block;
  width: 100%;
  line-height: 1.25;
  height: auto;
  max-height: 0;
  overflow: hidden;
  transition: all 400ms ease-out;
  ${(props) =>
    props.isOpen &&
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
