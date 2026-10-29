"use client";

import React from "react";
import { useCore } from "../../context/CoreProvider";

export interface StorefrontLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * StorefrontLink
 *
 * Framework-agnostic link component.
 * If a custom `linkComponent` is injected into <CoreProvider linkComponent={NextLink}>,
 * that component will be used (e.g. Next.js Link or React Router Link).
 * Otherwise falls back to a standard HTML <a> tag.
 */
export const StorefrontLink: React.FC<StorefrontLinkProps> = ({
  href,
  children,
  prefetch,
  replace,
  ...props
}) => {
  const core = useCore();
  const LinkComponent = core?.linkComponent;

  if (LinkComponent) {
    return (
      <LinkComponent href={href} prefetch={prefetch} replace={replace} {...props}>
        {children}
      </LinkComponent>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
};

export default StorefrontLink;

