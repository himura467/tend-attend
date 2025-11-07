import { rr } from "@/lib/utils/reverseRouter";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Header = (): React.JSX.Element => {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <nav className="hidden items-center gap-6 md:flex">
        <Link {...rr.index()} className="text-muted-foreground hover:text-primary transition-colors">
          <Image src="/logo.svg" alt="Home" width={32} height={32} />
        </Link>
      </nav>
    </header>
  );
};
