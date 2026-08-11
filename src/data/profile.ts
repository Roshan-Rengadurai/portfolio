export const profile = {
  name: "Roshan Rengadurai",
  initials: "RR",
  // Short, understated headline.
  headline: "developer, student, engineer",
  url: "https://roshan-rengadurai.vercel.app",
  githubUsername: "Roshan-Rengadurai",
  email: "roshan.rengadurai@gmail.com",
  links: {
    github: "https://github.com/Roshan-Rengadurai",
    linkedin: "https://www.linkedin.com/in/roshan-rengadurai-22601a2b2/",
    email: "mailto:roshan.rengadurai@gmail.com",
  },
  education: [
    {
      school: "Lambert High School",
      href: "https://www.forsyth.k12.ga.us/lhs",
      degree: "High School Diploma",
      start: "2023",
      end: "2027",
    },
    {
      school: "Georgia Institute of Technology",
      href: "https://www.gatech.edu/",
      degree: "Dual Enrollment",
      start: "2026",
      end: "2027"
    },
    {
      school: "Georgia State University",
      href: "https://www.gsu.edu/",
      degree: "Dual Enrollment",
      start: "2026",
      end: "2027"
    }
  ],
} as const;

export type Profile = typeof profile;
