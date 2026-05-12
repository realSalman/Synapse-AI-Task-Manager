'use client';

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function ErrorNavbar() {
  const { dayMode } = useTheme();
  return (
    <div className="bg-white border-day dark:bg-grey dark:border-night fixed top-0 left-0 flex w-full h-20 border-b">
      <div className="border-day dark:border-night w-64 border-r flex items-center px-8">
        <Link href="/">
          <img src={dayMode ? "/assets/logo-light.svg" : "/assets/logo-dark.svg"} alt="logo" className="h-6" />
        </Link>
      </div>
    </div>
  );
}
