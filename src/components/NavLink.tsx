"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  onClick?: () => void;
}

export default function NavLink({ href, children, external = false, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const className = `text-sm font-medium transition-colors pb-1 ${
    isActive
      ? "text-gray-900 border-b-2 border-gray-900"
      : "text-gray-600 hover:text-gray-900"
  }`;

  if (external) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
