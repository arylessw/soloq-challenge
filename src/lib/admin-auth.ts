export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim() || undefined;
}

export function verifyAdminSecret(provided: string | null | undefined): boolean {
  const secret = getAdminSecret();
  if (!secret || !provided) return false;
  return provided === secret;
}

export function verifyAdminRequest(request: Request): boolean {
  return verifyAdminSecret(request.headers.get("x-admin-secret"));
}

export async function requireAdmin(
  request: Request
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!getAdminSecret()) {
    return { ok: false, status: 503, error: "ADMIN_SECRET non configuré sur Vercel" };
  }
  if (!verifyAdminRequest(request)) {
    return { ok: false, status: 401, error: "Accès refusé" };
  }
  return { ok: true };
}
