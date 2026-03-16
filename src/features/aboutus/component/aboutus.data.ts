export type AboutUsIconName =
  | "target"
  | "eye"
  | "users"
  | "bookOpen"
  | "award"
  | "globe"
  | "book"
  | "accessibility";

export const aboutUsIntroCards = [
  {
    title: "Our Mission",
    description:
      "We help clinicians and learners study smarter with clear, structured medical content that supports long-term retention and confident decision-making.",
    icon: "target",
  },
  {
    title: "Our Vision",
    description:
      "We aim to make high-quality medical education more accessible through a modern learning experience built around practice, review, and continuous progress.",
    icon: "eye",
  },
] as const;

export const aboutUsImpact = {
  title: "Platform Impact",
  description:
    "A growing learning platform designed to support consistent study habits across core medical education workflows.",
  stats: [
    {
      label: "Users",
      value: "15000+",
      icon: "users",
    },
    {
      label: "Research",
      value: "1200+",
      icon: "bookOpen",
    },
    {
      label: "Awards",
      value: "450+",
      icon: "award",
    },
    {
      label: "Countries",
      value: "85+",
      icon: "globe",
    },
  ],
} as const;

export const aboutUsCoreValues = [
  {
    title: "Research Based",
    description:
      "Content is grounded in reliable sources and structured to support evidence-based learning.",
    icon: "book",
  },
  {
    title: "Collaborative",
    description:
      "We design experiences that encourage continuous practice, reflection, and shared progress.",
    icon: "users",
  },
  {
    title: "Accessible",
    description:
      "The platform is built to make quality study tools easier to use for learners across settings.",
    icon: "accessibility",
  },
] as const;
