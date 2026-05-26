import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

/** Version dans l’URL pour invalider le cache navigateur après changement de photo. */
export function userAvatarUrl(
  userId: string,
  hasAvatar: boolean,
  updatedAt?: Date | string | null
): string | null {
  if (!hasAvatar) return null;
  const v =
    updatedAt instanceof Date
      ? updatedAt.getTime()
      : updatedAt
        ? new Date(updatedAt).getTime()
        : 0;
  return `/api/avatars/${userId}?v=${v}`;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarMime: true,
      updatedAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: userAvatarUrl(user.id, !!user.avatarMime, user.updatedAt),
  };
}

export function validateEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "Adresse e-mail invalide";
  }
  return null;
}

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 24) {
    return "Le pseudo doit faire entre 2 et 24 caractères";
  }
  if (!/^[\p{L}\p{N}\s._-]+$/u.test(trimmed)) {
    return "Caractères non autorisés dans le pseudo";
  }
  return null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
