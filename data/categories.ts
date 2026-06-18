export const CATEGORIES = [
  "System Design",
  "Algorithms",
  "Data Structures",
  "Databases",
  "Networking",
  "Design Patterns",
  "OS & Concurrency",
  "Cloud & DevOps",
  "Behavioral",
  "Coding Patterns",
] as const;

export type Category = (typeof CATEGORIES)[number];
