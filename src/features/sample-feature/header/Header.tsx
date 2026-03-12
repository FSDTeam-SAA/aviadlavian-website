"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUIStore } from "@/store/ui.store";
import { useMyProfile } from "../hooks/useSample";

const Header = () => {
  const router = useRouter();
  const openSidebar = useUIStore((state) => state.openSidebar);
  const { data: profile } = useMyProfile();

  const fullName = [profile?.FirstName, profile?.LastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const initials = `${profile?.FirstName?.[0] ?? "A"}${profile?.LastName?.[0] ?? "L"}`;

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-30 h-16 border-b border-blue-950/40 bg-[#0f3b97] shadow-md">
        <button
          type="button"
          onClick={openSidebar}
          className="absolute top-3 left-5 z-40 inline-flex items-center justify-center rounded-lg border border-white/25 bg-[#0f3b97] p-2 text-white transition hover:bg-white/15 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0 ml-15 md:ml-0">
            <h1 className="text-xl font-bold tracking-wide text-white">LOGO</h1>
          </div>

          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/90"
                size={15}
              />
              <input
                type="text"
                placeholder="Search here"
                className="h-9 w-full rounded-full border border-white/55 bg-transparent pr-4 pl-9 text-sm text-white placeholder:text-white/80 outline-none transition focus:border-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-white transition hover:bg-white/15"
              aria-label="Go to settings page"
            >
              <span className="hidden text-xl font-medium text-white sm:inline">
                {fullName || "Aviad Lavian"}
              </span>
              <Avatar className="h-9 w-9 border-2 border-white/70">
                <AvatarFallback className="bg-slate-200 text-xs font-semibold text-slate-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
