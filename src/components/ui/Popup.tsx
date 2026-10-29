"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  style?: React.CSSProperties;
}

/**
 * Popup Component
 * 
 * Centralized modal component that uses React Portals to render on top of all other content.
 */
export const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-[600px]",
  style = {},
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      setMounted(false);
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-[2px] transition-all duration-300 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl animate-in fade-in zoom-in duration-200 ${maxWidth}`}
        style={style}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            {title && (
              <h2 className="text-[20px] font-[var(--font-bold,sans-serif)] text-[var(--core-primary,#00214c)] uppercase tracking-wide">
                {title}
              </h2>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 ml-auto"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Popup;

