// app/api/auth/gmail/link/route.ts
export const runtime = "nodejs";          // <— IMPORTANT for AWS SDK v3
export const dynamic = "force-dynamic";   // avoid static optimization

import { NextRequest, NextResponse } from "next/server";
import { upsertSecret } from "@/lib/secrets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const refreshToken = body?.refreshToken as string | undefined;
    const userSub = body?.userSub as string | undefined;
    const APP_ENV = process.env.APP_ENV || process.env.NEXT_PUBLIC_APP_ENV || process.env.AMPLIFY_ENV || "main";

    if (!refreshToken) return NextResponse.json({ ok: false, error: "missing refreshToken" }, { status: 400 });
    if (!userSub)     return NextResponse.json({ ok: false, error: "missing userSub" }, { status: 400 });

    const secretName = `/app/${APP_ENV}/${userSub}/gmail`;
    await upsertSecret(secretName, JSON.stringify({ refreshToken, linkedAt: new Date().toISOString() }));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // bubble up details so we can see the real issue from the client
    return NextResponse.json(
      { ok: false, error: e?.name || "Error", message: e?.message || String(e) },
      { status: 500 }
    );
  }
}
