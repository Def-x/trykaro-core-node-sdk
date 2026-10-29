"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { captureDeveloperException } from "../../lib/posthog";

/**
 * DeveloperErrorBoundary
 *
 * Catches uncaught React rendering errors in child components and
 * reports them directly to the Developer PostHog instance.
 */
interface DeveloperErrorBoundaryProps {
  children?: ReactNode;
  name?: string;
  fallback?: ReactNode | ((error: Error | null) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface DeveloperErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DeveloperErrorBoundary extends Component<
  DeveloperErrorBoundaryProps,
  DeveloperErrorBoundaryState
> {
  constructor(props: DeveloperErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DeveloperErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureDeveloperException(error, {
      componentStack: errorInfo?.componentStack,
      source: "DeveloperErrorBoundary",
      name: this.props.name || "UnnamedBoundary",
    });

    if (typeof this.props.onError === "function") {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback(this.state.error)
          : this.props.fallback;
      }

      // Default fallback in development vs production
      if (process.env.NODE_ENV === "development") {
        return (
          <div
            style={{
              padding: "16px",
              margin: "12px 0",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              color: "#991b1b",
              fontFamily: "monospace",
              fontSize: "13px",
            }}
          >
            <strong>Developer Error Caught:</strong>
            <p style={{ margin: "6px 0 0 0" }}>{this.state.error?.message}</p>
          </div>
        );
      }

      return null;
    }

    return this.props.children;
  }
}
