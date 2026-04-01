import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team — The People Behind SmartLink Pilot",
  description: "Meet the team of engineers, designers, and marketers building SmartLink Pilot. Based in Arusha, Tanzania and operating globally.",
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
