"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import styled, { css } from "styled-components";
import { getDocId } from "../../utils/docs/getDocsIds";
import { IoList } from "react-icons/io5";

interface TocProps {
  tocItems: Array<{ type: string; text: string }>;
  activeIds: string[];
  globalSiteConfigColors: any;
}

export const generateMarkdown = (
  tocItems: Array<{ type: string; text: string }>
) => {
  return tocItems
    .map((item) => {
      const anchor = getDocId(item.text);
      const prefix = item.type === "h3" ? "  " : "";
      return `${prefix}- [${item.text}](#${anchor})`;
    })
    .join("\n");
};

const ToC = ({ tocItems, activeIds, globalSiteConfigColors }: TocProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tocWrapperRef = useRef<HTMLDivElement>(null);

  
  const currentActiveId =
    activeIds.length > 0 ? activeIds[activeIds.length - 1] : "";

  useEffect(() => {
    const close = () => setIsOpen(false);
    const allLinks = document.querySelectorAll("a");
    allLinks.forEach((a) => a.addEventListener("click", close));

    return () => {
      allLinks.forEach((a) => a.removeEventListener("click", close));
    };
  }, []);

  useEffect(() => {
    if (tocWrapperRef.current && currentActiveId) {
      const tocList = tocWrapperRef.current;
      const activeLink = tocList.querySelector(`a[href="#${currentActiveId}"]`);

      if (activeLink) {
        // Get the active link's position relative to the ToC container
        const activeTop = (activeLink as HTMLElement).offsetTop;
        const activeHeight = (activeLink as HTMLElement).offsetHeight;
        const listHeight = tocList.clientHeight;
        const listScrollHeight = tocList.scrollHeight;

        
        const targetScrollTop = activeTop - listHeight / 2 + activeHeight / 2;

        
        const maxScroll = listScrollHeight - listHeight;
        const finalScrollTop = Math.min(targetScrollTop, maxScroll);

        
        const bottomThreshold = listHeight * 0.8; 
        const isNearBottom = activeTop > bottomThreshold;

        if (isNearBottom) {
          
          tocList.scrollTo({
            top: Math.max(0, activeTop - listHeight + activeHeight + 20),
            behavior: "smooth",
          });
        } else {
          
          tocList.scrollTo({
            top: finalScrollTop,
            behavior: "smooth",
          });
        }
      }
    }
  }, [currentActiveId]);

  
  useEffect(() => {
    if (tocWrapperRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (currentActiveId) {
  
          const event = new CustomEvent("scrollToActive", {
            detail: currentActiveId,
          });
          window.dispatchEvent(event);
        }
      });

      resizeObserver.observe(tocWrapperRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [currentActiveId]);

  
  useEffect(() => {
    const handleScroll = () => {
      if (tocWrapperRef.current && currentActiveId) {
        const tocList = tocWrapperRef.current;
        const activeLink = tocList.querySelector(
          `a[href="#${currentActiveId}"]`
        );

        if (activeLink) {
          const activeRect = activeLink.getBoundingClientRect();
          const tocRect = tocList.getBoundingClientRect();

          
          const isPartiallyVisible =
            activeRect.top >= tocRect.top &&
            activeRect.bottom <= tocRect.bottom;

          if (!isPartiallyVisible) {
            
            const activeTop = (activeLink as HTMLElement).offsetTop;
            const activeHeight = (activeLink as HTMLElement).offsetHeight;
            const listHeight = tocList.clientHeight;

            
            const isInBottomHalf = activeTop > tocList.scrollHeight / 2;

            if (isInBottomHalf) {
              
              tocList.scrollTo({
                top: Math.max(0, activeTop - listHeight + activeHeight + 20),
                behavior: "smooth",
              });
            } else {
              
              tocList.scrollTo({
                top: activeTop - listHeight / 2 + activeHeight / 2,
                behavior: "smooth",
              });
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentActiveId]);

  if (!tocItems || tocItems.length === 0) {
    return null;
  }

  const tocMarkdown = generateMarkdown(tocItems);

  
  const inactiveColor = "#808080";
  const inactiveLineColor = "#e0e0e0";

  return (
    <>
      <TocWrapper>
        <TocContent activeId={currentActiveId} isOpen={isOpen}>
          <TocDesktopHeader
            style={{
              color: "var(--primary-color-start)",
            }}
          >
            <div className="flex items-center gap-2">
              <IoList /> On This Page
            </div>
          </TocDesktopHeader>
          <TocOuterContainer>
            
            <VerticalLineContainer>
              <VerticalLine inactiveColor={inactiveLineColor} />
              
              {currentActiveId && (
                <ActiveIndicator
                  id={`indicator-${currentActiveId}`}
                  activeColor="var(--primary-color-start)"
                />
              )}
            </VerticalLineContainer>

            <TocTitleList
              ref={tocWrapperRef}
              className="max-h-[70vh] 2xl:max-h-[75vh] pl-6 overflow-y-auto"
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
                    const hrefText = props.href ? props.href.slice(1) : "";
                    const isActive = hrefText === currentActiveId;

                    
                    useEffect(() => {
                      if (isActive && tocWrapperRef.current) {
                        const activeLink = tocWrapperRef.current.querySelector(
                          `a[href="#${hrefText}"]`
                        ) as HTMLElement;
                        const indicator = document.getElementById(
                          `indicator-${hrefText}`
                        );

                        if (activeLink && indicator) {
                          const linkTop = activeLink.offsetTop;
                          const linkHeight = activeLink.offsetHeight;

                          indicator.style.top = `${linkTop}px`;
                          indicator.style.height = `${linkHeight}px`;
                        }
                      }
                    }, [isActive, hrefText]);

                    return (
                      <TocLink
                        {...props}
                        isActive={isActive}
                        activeColor="var(--primary-color-start)"
                        inactiveColor={inactiveColor}
                        className="block py-1 px-2 rounded-xl hover:bg-gray-50/75 transition-colors duration-150 font-medium no-underline"
                        data-id={hrefText}
                      >
                        {children}
                      </TocLink>
                    );
                  },
                }}
              >
                {tocMarkdown}
              </ReactMarkdown>
            </TocTitleList>
          </TocOuterContainer>
        </TocContent>
      </TocWrapper>
    </>
  );
};

export default ToC;


const TocOuterContainer = styled.div`
  position: relative;
  display: flex;
`;


const VerticalLineContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  padding: 4px 0;
  z-index: 1;
`;


const VerticalLine = styled.div<{ inactiveColor: string }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: ${(props) => props.inactiveColor};
  border-radius: 2px;
`;

const ActiveIndicator = styled.div<{ activeColor: string }>`
  position: absolute;
  left: 0;
  width: 3px;
  background-color: ${(props) => props.activeColor};
  border-radius: 2px;
  transition: top 0.3s ease, height 0.3s ease;
`;


const TocLink = styled.a<{
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
}>`
  color: ${(props) =>
    props.isActive ? props.activeColor : props.inactiveColor} !important;
  transition: color 0.2s ease;
`;

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
  width: 100%;
`;

const TocDesktopHeader = styled.span`
  display: none;
  font-size: 1rem;
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

const TocContent = styled.div<{ isOpen: boolean; activeId: string }>`
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
