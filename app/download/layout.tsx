import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download SmartLink Pilot App — Android & iOS",
  description: "Download the SmartLink Pilot mobile app for Android and iOS. Features clipboard URL detection — copy a link and shorten it instantly without opening the full app.",
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
