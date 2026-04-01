import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Our Story, Mission & Values",
  description: "Learn about SmartLink Pilot — the URL shortener built for modern marketers, developers, and content creators. Our story, mission, values, and the team behind the platform.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
