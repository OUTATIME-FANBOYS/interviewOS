import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewOS",
  description: "Coding interview prep flashcards & quizzes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#080a0e] text-[#e2e8f0] font-mono">
        <div className="max-w-md mx-auto min-h-screen bg-linear-to-b from-[#080a0e] via-[#0f1117] to-[#080a0e]">
          {children}
        </div>
      </body>
    </html>
  );
}
