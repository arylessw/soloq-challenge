import type { Prisma } from "@prisma/client";

export const playerWithOwnerInclude = {
  user: {
    select: {
      id: true,
      displayName: true,
      avatarMime: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.PlayerInclude;

export type PlayerWithOwner = Prisma.PlayerGetPayload<{
  include: typeof playerWithOwnerInclude;
}>;
