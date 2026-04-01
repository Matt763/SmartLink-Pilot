import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Get Help & Support",
  description: "Contact SmartLink Pilot for support, sales, or general enquiries. We respond within 24 hours. Includes a FAQ section covering the most common questions.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
