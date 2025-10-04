// app/api/auth/gmail/link/route.ts
import { NextRequest, NextResponse } from "next/server";
import { upsertSecret } from "@/lib/secrets";

// NOTE: simplest version for hackathon: caller sends userSub explicitly
// If you already have Cognito idToken, you can decode and derive sub instead.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const refreshToken = body?.refreshToken as string | undefined;
    const userSub = body?.userSub as string | undefined; // or derive from idToken

    if (!refreshToken) {
      return NextResponse.json({ ok: false, error: "missing refreshToken" }, { status: 400 });
    }
    if (!userSub) {
      return NextResponse.json({ ok: false, error: "missing userSub" }, { status: 400 });
    }

    // Secret naming convention: /app/dev/<userSub>/gmail
    const secretName = `/app/dev/${userSub}/gmail`;
    await upsertSecret(
      secretName,
      JSON.stringify({ refreshToken, linkedAt: new Date().toISOString() })
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
