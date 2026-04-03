import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PLAN_LABELS } from "@/lib/invoice";

export const dynamic = "force-dynamic";

async function getInvoice(token: string) {
  return prisma.invoice.findUnique({
    where: { token },
    include: { user: { select: { name: true, email: true } } },
  });
}

export default async function InvoicePage({ params }: { params: { token: string } }) {
  const invoice = await getInvoice(params.token);
  if (!invoice) notFound();

  const plan = PLAN_LABELS[invoice.planName] ?? PLAN_LABELS.pro;
  const formattedDate = new Date(invoice.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency", currency: invoice.currency,
  }).format(invoice.amount);

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            background: white !important;
          }
          .print-header { background: #4f46e5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-badge { background: #dcfce7 !important; color: #16a34a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-total { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-amount { color: #4f46e5 !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @page { margin: 16mm; size: A4; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#03050f] via-[#060b1e] to-[#0a0718] flex flex-col items-center py-12 px-4">

        {/* ── Action Bar ─────────────────────────────────────────────────── */}
        <div className="no-print w-full max-w-2xl flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">⚡</span>
            </div>
            <span className="text-white font-bold text-sm">SmartLink Pilot</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition hover:scale-[1.02] active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* ── Invoice Card ────────────────────────────────────────────────── */}
        <div className="print-card w-full max-w-2xl bg-gradient-to-b from-[#0d1230] to-[#0a0f24] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.12)] border border-[#1e2d5a]">

          {/* Top gradient stripe */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 via-60% to-amber-400" />

          {/* Header */}
          <div className="print-header bg-gradient-to-r from-indigo-900/60 to-purple-900/60 px-10 py-8 border-b border-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-indigo-300 text-xs font-bold tracking-[3px] uppercase mb-2">Official Receipt</p>
                <h1 className="text-4xl font-black text-white tracking-tight leading-none">INVOICE</h1>
                <p className="text-indigo-300/70 text-sm mt-2 font-mono">{invoice.invoiceNo}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-3">
                {/* Brand */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-4 py-2">
                  <span className="text-white font-black text-sm">⚡ SmartLinkPilot</span>
                </div>
                {/* PAID badge */}
                <div className="print-badge inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-xs font-black tracking-widest uppercase">Paid</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-8 space-y-8">

            {/* Meta row — date + invoice ref */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1.5">Date Issued</p>
                <p className="text-slate-200 font-semibold text-sm">{formattedDate}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1.5">Invoice No.</p>
                <p className="text-slate-200 font-mono font-bold text-sm">{invoice.invoiceNo}</p>
              </div>
            </div>

            {/* Billed to */}
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Billed To</p>
              <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-5">
                <p className="text-slate-100 font-bold text-base">{invoice.user?.name ?? "Customer"}</p>
                <p className="text-slate-400 text-sm mt-0.5">{invoice.user?.email}</p>
              </div>
            </div>

            {/* Line items */}
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Order Details</p>
              <div className="border border-[#1e2d5a] rounded-2xl overflow-hidden">
                {/* Column headers */}
                <div className="bg-[#0a0f28] px-5 py-3 grid grid-cols-[1fr_auto] gap-4 border-b border-[#1e2d5a]">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Description</span>
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider text-right">Amount</span>
                </div>
                {/* Line item */}
                <div className="px-5 py-5 grid grid-cols-[1fr_auto] gap-4 items-start">
                  <div>
                    <p className="text-slate-100 font-bold text-sm">{plan.label}</p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-xs">{plan.description}</p>
                    <span className="inline-block mt-2 text-xs font-semibold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded-full">Monthly Subscription</span>
                  </div>
                  <p className="text-slate-100 font-bold text-sm text-right">{formattedAmount}</p>
                </div>
                {/* Totals */}
                <div className="border-t border-[#1e2d5a] px-5 py-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-400">{formattedAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax</span>
                    <span className="text-slate-400">$0.00</span>
                  </div>
                </div>
                {/* Grand total */}
                <div className="print-total bg-gradient-to-r from-indigo-600/15 to-purple-600/15 border-t border-indigo-500/20 px-5 py-5">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-black text-sm uppercase tracking-wider">Total Charged</span>
                    <span className="print-amount text-2xl font-black bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                      {formattedAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction ID */}
            {invoice.trackingId && (
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Transaction Reference</p>
                <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl px-5 py-4">
                  <p className="text-cyan-400 font-mono text-xs break-all">{invoice.trackingId}</p>
                </div>
              </div>
            )}

            {/* Footer note */}
            <div className="border-t border-[#1e2d5a] pt-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Thank you for your business. For questions about this invoice,<br/>
                    contact us at{" "}
                    <a href="mailto:support@smartlinkpilot.com" className="text-indigo-400 hover:underline">
                      support@smartlinkpilot.com
                    </a>
                  </p>
                  <p className="text-slate-600 text-xs mt-2">
                    &copy; {new Date().getFullYear()} SmartLink Pilot. All rights reserved.
                  </p>
                </div>
                {/* Paid watermark */}
                <div className="flex-shrink-0 w-20 h-20 border-[3px] border-emerald-500/30 rounded-xl flex items-center justify-center rotate-[-12deg] opacity-60">
                  <span className="text-emerald-400 font-black text-sm tracking-widest uppercase">PAID</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom stripe */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400" />
        </div>

        {/* Download hint */}
        <p className="no-print mt-6 text-slate-600 text-xs text-center">
          Click &ldquo;Download PDF&rdquo; above &rarr; your browser will open a print dialog &rarr; select &ldquo;Save as PDF&rdquo;
        </p>

      </div>

      {/* Client-side print button handler */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelectorAll('button').forEach(btn => {
          if (btn.textContent.includes('Download PDF')) {
            btn.addEventListener('click', () => window.print());
          }
        });
      `}} />
    </>
  );
}
