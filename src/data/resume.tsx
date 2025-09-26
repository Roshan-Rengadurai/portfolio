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
    "I am a full stack developer, student, and creator. I am currently a high school student in the Atlanta metroplitan area and I am passionate about technology and innovation. With my dad as my inspiration for getting into the software field, I am dedicated to learning and growing in the field of software development.",
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
    "Linux (Arch, Ubuntu)",
    "TailwindCSS",
    "Figma",
    "Adobe Premire Pro",
    "Adobe Photoshop",
    "Linux",
    "Server Building",
    "Version Control",
    "Bash",
    "MacOS",
    "Windows",
    "Canva",
    "Postman",
    "Discord (Bots)",
    "NASA APIs",
    "REST APIs"
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
      end: "2027",
    },
  ],
  projects: [
    {
      title: "Mars Information",
      href: "https://nasa-mars.vercel.app/",
      dates: "Jan 2024 - Feb 2024",
      active: false,
      description:
        "Utilized NASA APIs (specifically Insight API) to gather and display data about Mars' weather and geological conditions, as well as Mars Rover Photos API to showcase the latest images captured by the rovers, specifically NASA's Curiosity, Opportunity, and Spirit rovers on Mars.",
      technologies: [
        "Next.js",
        "Typescript/Javascript",
        "TailwindCSS",
        "REST APIs",
        "Postman",
        "NASA APIs",
        "React",
        "Vercel"
      ],
      links: [
        {
          type: "Click here to view project",
          href: "https://nasa-mars.vercel.app/",
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
