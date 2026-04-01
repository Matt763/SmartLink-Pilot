import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import { ExternalLink, ShieldCheck } from "lucide-react";

export default async function PreviewPage({ params }: { params: { shortCode: string } }) {
  const url = await prisma.url.findUnique({
    where: { shortCode: params.shortCode },
  });

  if (!url) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center">
        <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Link Preview</h1>
        <p className="text-gray-600 mb-8">You are about to be redirected to the following destination:</p>
        
        <div className="bg-gray-50 p-6 rounded-xl break-all mb-8 border border-gray-200">
          <p className="text-lg font-medium text-blue-600">{url.originalUrl}</p>
        </div>

        <Link href={`/${params.shortCode}`} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white w-full sm:w-auto px-8 py-4 rounded-xl hover:bg-blue-700 transition font-medium shadow-md">
          Continue to Website <ExternalLink size={20} />
        </Link>

        <p className="mt-10 text-xs font-medium tracking-wide uppercase text-gray-400">Powered by SMARTLINK PILOT</p>
      </div>
    </div>
  );
}
