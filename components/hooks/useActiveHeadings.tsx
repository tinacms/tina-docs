import { useState, useEffect } from 'react';

export function useActiveHeadings(headingSelectors = 'h2, h3, h4, h5, h6') {
  const [activeIds, setActiveIds] = useState<string[]>([]);

  useEffect(() => {
    // Get all headings on the page
    const headings = document.querySelectorAll(headingSelectors);
    if (headings.length === 0) return;

    // Create a map to store heading positions
    const headingPositions = new Map<string, number>();
    
    // Function to update heading positions
    const updateHeadingPositions = () => {
      headings.forEach((heading) => {
        const id = heading.getAttribute('id');
        if (id) {
          // Store the top position of each heading relative to the document
          headingPositions.set(id, heading.getBoundingClientRect().top + window.scrollY);
        }
      });
    };

    // Initial position calculation
    updateHeadingPositions();

    // Update positions on resize
    window.addEventListener('resize', updateHeadingPositions);

    // Function to determine which heading is active based on scroll position
    const onScroll = () => {
      // Get current scroll position with a small offset
      const scrollPosition = window.scrollY + 100; // 100px offset from the top
      
      // Find the heading that is currently at or above the scroll position
      let currentActiveIds: string[] = [];
      
      // Convert map to array, sort by position, and find all headings above scroll position
      const sortedHeadings = Array.from(headingPositions.entries())
        .sort((a, b) => a[1] - b[1]);
      
      for (const [id, position] of sortedHeadings) {
        if (position <= scrollPosition) {
          currentActiveIds.push(id);
        }
      }
      
      // Special case for bottom of page
      const bottomOfPage = window.scrollY + window.innerHeight >= document.body.scrollHeight - 50;
      if (bottomOfPage && sortedHeadings.length > 0) {
        // If at bottom, ensure the last heading is active
        const lastHeadingId = sortedHeadings[sortedHeadings.length - 1][0];
        if (!currentActiveIds.includes(lastHeadingId)) {
          currentActiveIds.push(lastHeadingId);
        }
      }
      
      // Update active IDs if changed
      if (JSON.stringify(currentActiveIds) !== JSON.stringify(activeIds)) {
        setActiveIds(currentActiveIds);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', onScroll);
    
    // Initial check
    onScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateHeadingPositions);
    };
  }, [headingSelectors]);

  return activeIds;
}