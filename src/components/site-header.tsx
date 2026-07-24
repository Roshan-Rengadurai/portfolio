import { profile } from "@/data/profile";

export function SiteHeader() {
  return (
    <header className="fixed left-3 top-3 z-hud sm:left-4 sm:top-4">
      <a
        href="#home"
        className="focus-ring group flex items-center gap-2 rounded-md px-1.5 py-1"
        aria-label={`${profile.name}, home`}
      >

      </a>
    </header>
  );
}
