import Link from "next/link";
import type { Route } from "next";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type SmartLinkProps = {
  href: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

const isInternalRoute = (href: string): href is Route => href.startsWith("/");

export function SmartLink({ href, children, target, rel, ...rest }: SmartLinkProps) {
  if (isInternalRoute(href)) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target={target ?? "_blank"} rel={rel ?? "noreferrer"} {...rest}>
      {children}
    </a>
  );
}
