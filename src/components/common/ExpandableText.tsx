/**
 * ExpandableText component - Shows truncated text with expand/collapse toggle
 */

import React, { useState, useRef, useEffect } from "react";

interface ExpandableTextProps {
  text: string;
  className?: string;
  lines?: number;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  className = "",
  lines = 3,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Check if text overflows and needs truncation
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;
        // scrollHeight gives full content height, clientHeight gives visible height
        // With line-clamp, if content is truncated, scrollHeight > clientHeight
        setNeedsTruncation(element.scrollHeight > element.clientHeight + 1);
      }
    };

    // Check on mount and after a brief delay (for font loading)
    checkOverflow();
    const timer = setTimeout(checkOverflow, 100);

    // Also check on window resize
    window.addEventListener("resize", checkOverflow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [text]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const lineClampClass = lines === 3 ? "lmw-line-clamp-3" : "";

  return (
    <div className={`lmw-expandable-text ${!isExpanded && needsTruncation ? "lmw-expandable-collapsed" : ""}`}>
      <p
        ref={textRef}
        className={`${className} ${!isExpanded ? lineClampClass : ""}`}
      >
        {text}
        {isExpanded && needsTruncation && (
          <button
            onClick={toggleExpand}
            className="lmw-expand-toggle lmw-expand-toggle-inline"
            aria-expanded={isExpanded}
            type="button"
          >
            less ▴
          </button>
        )}
      </p>
      {!isExpanded && needsTruncation && (
        <button
          onClick={toggleExpand}
          className="lmw-expand-toggle lmw-expand-toggle-overlay"
          aria-expanded={isExpanded}
          type="button"
        >
          more ▾
        </button>
      )}
    </div>
  );
};
