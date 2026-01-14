"use client";

import Image, { type ImageLoader } from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";

interface ImageOverlayWrapperProps {
  children: React.ReactNode;
  src: string;
  alt: string;
  caption?: string;
}

// Custom image loader to bypass Next.js image optimization
const customImageLoader: ImageLoader = ({ src, width, quality }) => {
  // If it's already an absolute URL (starts with http:// or https://), return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // For relative paths, prepend the base path if it exists
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const fullSrc = `${basePath}${src}`;

  // If the src already includes query parameters, append with &, otherwise use ?
  const separator = fullSrc.includes("?") ? "&" : "?";
  return `${fullSrc}${separator}w=${width}&q=${quality || 75}`;
};

export const ImageOverlayWrapper = ({
  children,
  src,
  alt,
  caption,
}: ImageOverlayWrapperProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Disable scrolling when overlay is open
      document.body.style.overflow = "hidden";

      // Focus the overlay for keyboard interaction
      if (overlayRef.current) {
        overlayRef.current.focus();
      }

      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const openOverlay = () => {
    setIsOpen(true);
    setIsLoading(true); // Reset loading state when opening overlay
  };

  const closeOverlay = () => setIsOpen(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeOverlay();
    }
  };

  const overlay =
    isOpen && mounted
      ? createPortal(
          <div
            ref={overlayRef}
            tabIndex={-1}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg outline-none"
            onClick={closeOverlay}
            onKeyDown={handleKeyDown}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeOverlay}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 border border-brand-primary hover:border-brand-primary-hover bg-neutral-background-secondary hover:bg-neutral-background-secondary/80 rounded-full transition-colors duration-200 group"
              aria-label="Close image overlay"
            >
              <MdClose className="w-6 h-6 text-neutral-text group-hover:text-neutral-text-secondary" />
            </button>

            {/* Image container */}
            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center p-8">
              <div className="relative flex flex-col items-center justify-center">
                <div
                  className="relative w-[80vw] h-[80vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Loading skeleton */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-background-secondary/50 rounded-lg">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-neutral-text-secondary text-sm">
                          Loading image...
                        </p>
                      </div>
                    </div>
                  )}

                  <Image
                    loader={customImageLoader}
                    src={src}
                    alt={alt}
                    fill
                    style={{ objectFit: "contain", objectPosition: "center" }}
                    onLoad={handleImageLoad}
                  />
                </div>

                {/* Caption */}
                {caption && (
                  <div
                    className="mt-4 px-4 py-2 rounded-lg bg-neutral-background"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-neutral-text text-sm text-center font-light">
                      {caption}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Click anywhere to close hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <p className="text-neutral-text-secondary text-sm">
                Click anywhere to close
              </p>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openOverlay}
        className="cursor-pointer transition-opacity duration-200 hover:opacity-80 active:opacity-90 border-none bg-transparent p-0 md:block w-full flex justify-center"
        aria-label={`Open image overlay: ${alt}`}
      >
        {children}
      </button>
      {overlay}
    </>
  );
};
