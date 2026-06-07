"use client";

import { useState } from "react";

interface LinkedInCaptionProps {
  text: string;
  maxLines?: number;
}

export function LinkedInCaption({ text, maxLines = 3 }: LinkedInCaptionProps) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n");
  const shouldTruncate = lines.length > maxLines || text.length > 280;
  const preview = lines.slice(0, maxLines).join("\n");

  return (
    <div className="text-sm leading-relaxed text-slate-800">
      {expanded || !shouldTruncate ? (
        <p className="whitespace-pre-wrap">{text}</p>
      ) : (
        <p className="whitespace-pre-wrap">
          {preview}
          {text.length > preview.length && (
            <>
              {" "}
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="font-medium text-slate-500 hover:text-slate-700"
              >
                …more
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}
