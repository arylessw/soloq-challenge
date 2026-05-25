import { NextResponse } from "next/server";
import { getAdminDashboard } from "@/lib/admin-dashboard";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const dashboard = await getAdminDashboard();
  return NextResponse.json(dashboard);
}
