function normalizeSecret(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  let s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s || undefined;
}

export function getAdminSecret(): string | undefined {
  return normalizeSecret(process.env.ADMIN_SECRET);
}

export function verifyAdminSecret(provided: string | null | undefined): boolean {
  const secret = getAdminSecret();
  const candidate = normalizeSecret(provided);
  if (!secret || !candidate) return false;
  return candidate === secret;
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
