import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  isAllowedAdminEmail,
  verifyAdminSessionCookie,
} from "@/lib/admin/auth";
import { adminAuth } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }

  try {
    const admin = await verifyAdminSessionCookie(sessionCookie);
    if (!admin) {
      return NextResponse.json({ admin: null }, { status: 401 });
    }
    return NextResponse.json({ admin });
  } catch {
    return NextResponse.json({ admin: null }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!isAllowedAdminEmail(decodedToken.email)) {
      return NextResponse.json(
        { error: "This email is not allowed for admin access" },
        { status: 403 },
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: ADMIN_SESSION_MAX_AGE * 1000,
    });

    const response = NextResponse.json({
      admin: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired login token" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
