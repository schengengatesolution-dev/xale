import { prisma } from "@/lib/prisma";
import {
  PAYOUT_BATCH_STATUS,
  SETTLEMENT_STATUS,
  batchLabelFromCutoff,
  formatCutoffMn,
  getLastThursdayCutoff,
} from "@/lib/business-day";
import { sellerHasBank } from "@/lib/settle-payment";

export type SellerBatchGroup = {
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  phone: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
  hasBank: boolean;
  orderCount: number;
  amountSellerMnt: number;
  amountPlatformMnt: number;
  amountGrossMnt: number;
  settlementIds: string[];
};

export type WeeklyBatchPreview = {
  cutoffAt: string;
  cutoffLabel: string;
  batchLabel: string;
  settlementCount: number;
  sellerCount: number;
  totalSellerMnt: number;
  totalPlatformMnt: number;
  totalGrossMnt: number;
  sellersMissingBank: number;
  groups: SellerBatchGroup[];
};

type SettlementRow = {
  id: string;
  amountSellerMnt: number;
  amountPlatformMnt: number;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    bankName: string | null;
    bankAccount: string | null;
    bankAccountName: string | null;
  };
  payment: { amountMnt: number };
};

export function groupSettlementsBySeller(
  rows: SettlementRow[]
): SellerBatchGroup[] {
  const map = new Map<string, SellerBatchGroup>();
  for (const s of rows) {
    let g = map.get(s.sellerId);
    if (!g) {
      g = {
        sellerId: s.sellerId,
        sellerName: s.seller.name,
        sellerEmail: s.seller.email,
        phone: s.seller.phone,
        bankName: s.seller.bankName,
        bankAccount: s.seller.bankAccount,
        bankAccountName: s.seller.bankAccountName,
        hasBank: sellerHasBank(s.seller),
        orderCount: 0,
        amountSellerMnt: 0,
        amountPlatformMnt: 0,
        amountGrossMnt: 0,
        settlementIds: [],
      };
      map.set(s.sellerId, g);
    }
    g.orderCount += 1;
    g.amountSellerMnt += s.amountSellerMnt;
    g.amountPlatformMnt += s.amountPlatformMnt;
    g.amountGrossMnt += s.payment.amountMnt;
    g.settlementIds.push(s.id);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.sellerName.localeCompare(b.sellerName, "mn")
  );
}

export async function loadReadySettlementsUpToCutoff(
  cutoffAt: Date,
  statuses: string[] = [SETTLEMENT_STATUS.READY]
) {
  return prisma.settlement.findMany({
    where: {
      status: { in: statuses },
      createdAt: { lte: cutoffAt },
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bankName: true,
          bankAccount: true,
          bankAccountName: true,
        },
      },
      payment: { select: { amountMnt: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function buildWeeklyBatchPreview(
  ref: Date = new Date()
): Promise<WeeklyBatchPreview> {
  const cutoffAt = getLastThursdayCutoff(ref);
  const rows = await loadReadySettlementsUpToCutoff(cutoffAt);
  const groups = groupSettlementsBySeller(rows);
  const totalSellerMnt = groups.reduce((a, g) => a + g.amountSellerMnt, 0);
  const totalPlatformMnt = groups.reduce((a, g) => a + g.amountPlatformMnt, 0);
  const totalGrossMnt = groups.reduce((a, g) => a + g.amountGrossMnt, 0);
  return {
    cutoffAt: cutoffAt.toISOString(),
    cutoffLabel: formatCutoffMn(cutoffAt),
    batchLabel: batchLabelFromCutoff(cutoffAt),
    settlementCount: rows.length,
    sellerCount: groups.length,
    totalSellerMnt,
    totalPlatformMnt,
    totalGrossMnt,
    sellersMissingBank: groups.filter((g) => !g.hasBank).length,
    groups,
  };
}

function csvEscape(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Bank-upload oriented CSV (UTF-8 BOM for Excel). */
export function buildBatchCsv(preview: WeeklyBatchPreview): string {
  const header = [
    "seller_name",
    "bank_name",
    "bank_account",
    "bank_account_name",
    "amount_mnt",
    "order_count",
    "seller_email",
    "phone",
    "settlement_ids",
  ];
  const lines = [header.join(",")];
  for (const g of preview.groups) {
    lines.push(
      [
        csvEscape(g.sellerName),
        csvEscape(g.bankName),
        csvEscape(g.bankAccount),
        csvEscape(g.bankAccountName),
        csvEscape(g.amountSellerMnt),
        csvEscape(g.orderCount),
        csvEscape(g.sellerEmail),
        csvEscape(g.phone),
        csvEscape(g.settlementIds.join("|")),
      ].join(",")
    );
  }
  return "\uFEFF" + lines.join("\n") + "\n";
}

export async function buildPayableBatchPreview(
  ref: Date = new Date()
): Promise<WeeklyBatchPreview> {
  const cutoffAt = getLastThursdayCutoff(ref);
  const rows = await loadReadySettlementsUpToCutoff(cutoffAt, [
    SETTLEMENT_STATUS.READY,
    SETTLEMENT_STATUS.PROCESSING,
  ]);
  const groups = groupSettlementsBySeller(rows);
  const totalSellerMnt = groups.reduce((a, g) => a + g.amountSellerMnt, 0);
  const totalPlatformMnt = groups.reduce((a, g) => a + g.amountPlatformMnt, 0);
  const totalGrossMnt = groups.reduce((a, g) => a + g.amountGrossMnt, 0);
  return {
    cutoffAt: cutoffAt.toISOString(),
    cutoffLabel: formatCutoffMn(cutoffAt),
    batchLabel: batchLabelFromCutoff(cutoffAt),
    settlementCount: rows.length,
    sellerCount: groups.length,
    totalSellerMnt,
    totalPlatformMnt,
    totalGrossMnt,
    sellersMissingBank: groups.filter((g) => !g.hasBank).length,
    groups,
  };
}

export async function markWeeklyBatchPaid(opts: {
  operatorEmail: string;
  operatorNote?: string | null;
  markExported?: boolean;
}): Promise<{
  batchId: string;
  label: string;
  settlementCount: number;
  sellerCount: number;
  totalSellerMnt: number;
}> {
  const preview = await buildPayableBatchPreview();
  if (preview.settlementCount === 0) {
    throw new Error("EMPTY_BATCH");
  }
  if (preview.sellersMissingBank > 0) {
    throw new Error("MISSING_BANK");
  }

  const allIds = preview.groups.flatMap((g) => g.settlementIds);
  const now = new Date();
  const cutoffAt = new Date(preview.cutoffAt);

  const batch = await prisma.$transaction(async (tx) => {
    const created = await tx.payoutBatch.create({
      data: {
        label: preview.batchLabel,
        cutoffAt,
        status: PAYOUT_BATCH_STATUS.PAID,
        operatorEmail: opts.operatorEmail,
        operatorNote: opts.operatorNote || null,
        paidAt: now,
        exportedAt: opts.markExported ? now : now,
        totalSellerMnt: preview.totalSellerMnt,
        totalPlatformMnt: preview.totalPlatformMnt,
        sellerCount: preview.sellerCount,
        settlementCount: preview.settlementCount,
      },
    });

    await tx.settlement.updateMany({
      where: {
        id: { in: allIds },
        status: {
          in: [SETTLEMENT_STATUS.READY, SETTLEMENT_STATUS.PROCESSING],
        },
      },
      data: {
        status: SETTLEMENT_STATUS.PAID_OUT,
        paidOutAt: now,
        payoutBatchId: created.id,
        note: opts.operatorNote || `Batch ${preview.batchLabel}`,
      },
    });

    return created;
  });

  return {
    batchId: batch.id,
    label: batch.label,
    settlementCount: preview.settlementCount,
    sellerCount: preview.sellerCount,
    totalSellerMnt: preview.totalSellerMnt,
  };
}

export async function markWeeklyBatchExported(opts: {
  operatorEmail: string;
  operatorNote?: string | null;
}): Promise<{ batchId: string; label: string; settlementCount: number }> {
  const preview = await buildWeeklyBatchPreview();
  if (preview.settlementCount === 0) {
    throw new Error("EMPTY_BATCH");
  }

  const allIds = preview.groups.flatMap((g) => g.settlementIds);
  const now = new Date();
  const cutoffAt = new Date(preview.cutoffAt);

  const batch = await prisma.$transaction(async (tx) => {
    const created = await tx.payoutBatch.create({
      data: {
        label: preview.batchLabel,
        cutoffAt,
        status: PAYOUT_BATCH_STATUS.EXPORTED,
        operatorEmail: opts.operatorEmail,
        operatorNote: opts.operatorNote || null,
        exportedAt: now,
        totalSellerMnt: preview.totalSellerMnt,
        totalPlatformMnt: preview.totalPlatformMnt,
        sellerCount: preview.sellerCount,
        settlementCount: preview.settlementCount,
      },
    });

    await tx.settlement.updateMany({
      where: {
        id: { in: allIds },
        status: SETTLEMENT_STATUS.READY,
      },
      data: {
        status: SETTLEMENT_STATUS.PROCESSING,
        payoutBatchId: created.id,
        note: opts.operatorNote || `Exported ${preview.batchLabel}`,
      },
    });

    return created;
  });

  return {
    batchId: batch.id,
    label: batch.label,
    settlementCount: preview.settlementCount,
  };
}
