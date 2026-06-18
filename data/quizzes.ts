import type { Quiz } from "@/lib/types";

// Placeholder — replace with your full 80+ quiz dataset
export const QUIZZES: Quiz[] = [
  {
    cat: "Algorithms",
    sub: "Sorting",
    q: "Which sorting algorithm has O(n log n) worst-case time complexity?",
    opts: ["QuickSort", "MergeSort", "BubbleSort", "InsertionSort"],
    correct: 1,
    exp: "MergeSort guarantees O(n log n) in all cases. QuickSort degrades to O(n²) on already-sorted data without randomization.",
  },
  {
    cat: "System Design",
    sub: "Fundamentals",
    q: "What does CAP theorem state?",
    opts: [
      "A distributed system can guarantee at most 2 of: Consistency, Availability, Partition tolerance",
      "All distributed systems must be consistent",
      "Availability and Consistency can always coexist",
      "Partition tolerance is optional in distributed systems",
    ],
    correct: 0,
    exp: "CAP theorem (Brewer's theorem) states a distributed system can only guarantee two of the three properties simultaneously.",
  },
];
