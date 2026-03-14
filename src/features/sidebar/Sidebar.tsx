"use client";

import React from "react";
import {
  BookText,
  FileText,
  Home,
  Info,
  Library,
  MessageSquare,
  Settings,
  Sparkles,
  SquareKanban,
  X,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUIStore } from "@/store/ui.store";
import { signOut } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type MenuItem = {
  label: string;
  icon: React.ElementType;
  url?: string;
};

const menuItems: MenuItem[] = [
  { label: "Home", icon: Home, url: "/" },
  { label: "Library", icon: Library, url: "/library" },
  { label: "About", icon: Info, url: "/about" },
  { label: "Question Bank", icon: SquareKanban, url: "/questionbank" },
  { label: "Learning Plan", icon: FileText, url: "/learningplan" },
  { label: "Flashcards", icon: Sparkles, url: "/flashcards" },
  { label: "Custom Quizzes", icon: BookText, url: "/custom-quizzes" },
  { label: "Settings", icon: Settings, url: "/settings" },
  { label: "Feedback", icon: MessageSquare, url: "/feedback" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const closeSidebar = useUIStore((state) => state.closeSidebar);

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Show loading toast
      toast.loading("Signing out...", {
        id: "logout-toast",
      });

      // Sign out using NextAuth
      await signOut({
        redirect: false,
        callbackUrl: "/auth/sign-in",
      });

      // Dismiss loading toast and show success
      toast.success("Signed out successfully", {
        id: "logout-toast",
        description: "You have been logged out of your account.",
        duration: 3000,
      });

      // Close sidebar
      closeSidebar();

      // Redirect to sign-in page
      router.push("/auth/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      toast.error("Failed to sign out", {
        id: "logout-toast",
        description: "An error occurred while signing out. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-slate-700/80 bg-[#1f252d] shadow-xl transition-transform duration-300 md:top-16 md:z-20 md:h-[calc(100vh-4rem)] md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-end border-b border-slate-700/70 px-4 py-3">
          <button
            type="button"
            onClick={closeSidebar}
            className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-700/70 hover:text-slate-100 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.url
                ? item.url === "/"
                  ? pathname === "/"
                  : pathname === item.url || pathname.startsWith(item.url + "/")
                : false;

              return (
                <li key={item.label}>
                  {item.url ? (
                    <Link
                      href={item.url}
                      onClick={closeSidebar}
                      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-[#0b7760] text-white"
                          : "text-slate-100 hover:bg-slate-700/60"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-700/60"
                      onClick={closeSidebar}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Section at Bottom */}
        <div className="border-t border-slate-700/70 p-2">
          <button
            type="button"
            onClick={() => setIsLogoutDialogOpen(true)}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={18} />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent className="border-slate-700 bg-[#1f252d] text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">
              Are you sure you want to sign out?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You will be redirected to the sign-in page and will need to log in
              again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700 hover:text-slate-100"
              disabled={isLoggingOut}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
            >
              {isLoggingOut ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing out...
                </span>
              ) : (
                "Yes, sign out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Sidebar;
