import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import {
  buildBatchCsv,
  buildPayableBatchPreview,
  markWeeklyBatchExported,
  markWeeklyBatchPaid,
} from "@/lib/payout-batch";
import { prisma } from "@/lib/prisma";

/** Preview weekly Friday-cutoff READY batch grouped by seller. */
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 });
  }

  const format = req.nextUrl.searchParams.get("format");
  const preview = await buildPayableBatchPreview();

  if (format === "csv") {
    const csv = buildBatchCsv(preview);
    const filename = `hairan-payout-${preview.batchLabel}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const recentBatches = await prisma.payoutBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ preview, recentBatches });
}

const postSchema = z.object({
  action: z.enum(["mark_paid", "mark_exported"]),
  operatorNote: z.string().max(2000).optional().nullable(),
});

/**
 * mark_exported → READY settlements → PROCESSING + batch EXPORTED (CSV already downloaded)
 * mark_paid → READY (or leave PROCESSING alone if separate) → PAID_OUT + batch PAID
 *
 * For simplicity mark_paid takes current READY-up-to-cutoff set.
 * If already exported (PROCESSING), use action on those via settlement ids in batch —
 * mark_paid here always pays the current READY preview; use PATCH for single rows.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 });
  }

  try {
    const body = postSchema.parse(await req.json());

    if (body.action === "mark_exported") {
      const result = await markWeeklyBatchExported({
        operatorEmail: admin.email,
        operatorNote: body.operatorNote,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    const result = await markWeeklyBatchPaid({
      operatorEmail: admin.email,
      operatorNote: body.operatorNote,
      markExported: true,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Мэдээлэл буруу" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "";
    if (msg === "EMPTY_BATCH") {
      return NextResponse.json(
        { error: "Cutoff хүртэл READY settlement байхгүй" },
        { status: 400 }
      );
    }
    if (msg === "MISSING_BANK") {
      return NextResponse.json(
        {
          error:
            "Зарим худалдагчийн банкны мэдээлэл бүрэн бус — эхлээд банк бөглөөрэй",
        },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
