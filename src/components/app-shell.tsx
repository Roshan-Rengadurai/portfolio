import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { EmailModal } from "@/components/email-modal";
import { ConsoleOverlay } from "@/components/console-overlay";

/** Section ids, in page order — the scroll-spy nav reads this list. */
export const SECTIONS = ["home", "education", "projects"] as const;
export type SectionId = (typeof SECTIONS)[number];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="relative z-content mx-auto flex min-h-dvh w-full max-w-content flex-col px-5 sm:px-8 lg:px-12">
        <main className="flex-1">{children}</main>
      </div>

      <BottomNav />
      <EmailModal />
      <ConsoleOverlay />
    </>
  );
}
