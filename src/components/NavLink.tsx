"use client";

import type { ComponentProps, ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";

type Href = ComponentProps<typeof Link>["href"];

export default function NavLink({
  href,
  children,
  className = "",
  activeClassName = "",
  exact = false,
  onClick,
}: {
  href: Href;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const target = typeof href === "string" ? href : href.pathname ?? "/";
  const active =
    exact || target === "/"
      ? pathname === target
      : pathname === target || pathname.startsWith(`${target}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${className} ${active ? activeClassName : ""}`}
    >
      {children}
    </Link>
  );
}
