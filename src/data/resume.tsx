import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Roshan Rengadurai",
  initials: "RR",
  url: "https://www.roshanrengadurai.com",
  location: "Atlanta, GA",
  locationLink: "https://www.google.com/maps/place/Atlanta",
  description:
    "Full Stack Developer, Student, and Creator",
  summary:
    "I am a full stack developer, student, and creator. I am currently a high school student in the metroplitan area and I am passionate about technology and innovation. With my dad as my inspiration for getting into the software field, I am dedicated to learning and growing in the field of software development.",
  avatarUrl: "/me.png",
  skills: [
    "React",
    "Typescript",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "HTML",
    "Git/Github",
    "Linux",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "hello@example.com",
    tel: "+123456789",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/Roshan-Rengadurai",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/roshan-rengadurai-22601a2b2/",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://dub.sh/dillion-twitter",
        icon: Icons.x,

        navbar: false,
      },
      Youtube: {
        name: "Youtube",
        url: "https://dub.sh/dillion-youtube",
        icon: Icons.youtube,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "mailto:roshan.rengadurai@gmail.com",
        icon: Icons.email,

        navbar: false,
      },
    },
  },

  work: [
    {
      company: "No Work Experience Yet.",
      href: "example.com",
      badges: [],
      location: "Remote",
      title: "Student",
      logoUrl: "",
      start: "Feb 2009",
      end: "Dec 2025",
      description:
        "I am a student. This is a temporary placeholder for my work experience in the future. As of right now, I have no work experience as I am focusing my energy on education before I enter the workforce."
    },
  ],
  education: [
    {
      school: "Lambert High School",
      href: "https://www.forsyth.k12.ga.us/lhs",
      degree: "High School Diploma",
      logoUrl: "/lambert.png",
      start: "2023",
      end: "2024",
    },
  ],
  projects: [
    {
      title: "[WIP]",
      href: "https://example.com",
      dates: "Jan 2024 - Feb 2024",
      active: false,
      description:
        "Currently working on a project to help me learn more about the software development process. This is a temporary placeholder for my projects in the future. As of right now, I have no public projects to show.",
      technologies: [
        "Next.js",
        "Typescript",
        "TailwindCSS",
        "Rust",
        "Shadcn UI",
      ],
      links: [
        {
          type: "Check Out My LinkedIn!",
          href: "https://www.linkedin.com/in/roshan-rengadurai-22601a2b2/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "",
      video:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  ],
  hackathons: [
    {
      title: "Hack Western 5",
      dates: "November 23rd - 25th, 2018",
      location: "London, Ontario",
      description:
        "Developed a mobile application which delivered bedtime stories to children using augmented reality.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-western.png",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    }
  ],
} as const;
