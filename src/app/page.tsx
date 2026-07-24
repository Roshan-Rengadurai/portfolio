import { AppShell } from "@/components/app-shell";
import { Hero } from "@/components/sections/hero";
import { GithubContributions } from "@/components/sections/github-contributions";
import { Projects } from "@/components/sections/projects";
import { TerminalSection } from "@/components/sections/terminal";

export default function Page() {
  return (
    <AppShell
      views={{
        home: <Hero />,
        github: <GithubContributions />,
        projects: <Projects />,
        terminal: <TerminalSection />,
      }}
    />
  );
}
