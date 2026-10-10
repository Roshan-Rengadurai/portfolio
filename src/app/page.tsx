import { AppShell } from "@/components/app-shell";
import { Hero } from "@/components/sections/hero";
import { Education } from "@/components/sections/education";
import { Projects } from "@/components/sections/projects";
import { SiteFooter } from "@/components/site-footer";

export default function Page() {
  return (
    <AppShell>
      <Hero />
      <Education />
      <Projects />
      <SiteFooter />
    </AppShell>
  );
}
