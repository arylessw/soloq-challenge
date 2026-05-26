type BlockProps = {
  className?: string;
};

export function Skeleton({ className = "" }: BlockProps) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Chargement du classement">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-16 rounded-xl" />
        ))}
      </div>
      <div className="text-center space-y-3">
        <Skeleton className="h-8 w-48 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-64 mx-auto rounded" />
      </div>
      <div className="flex items-end justify-center gap-4 px-4">
        <Skeleton className="h-40 w-28 rounded-2xl" />
        <Skeleton className="h-52 w-32 rounded-2xl" />
        <Skeleton className="h-36 w-28 rounded-2xl" />
      </div>
      <div className="table-shell p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function MatchListSkeleton() {
  return (
    <ul className="space-y-2" aria-busy="true" aria-label="Chargement des parties">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i}>
          <Skeleton className="h-[72px] w-full rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

export function ProfileBannerSkeleton() {
  return (
    <div className="profile-banner skeleton-banner rounded-2xl overflow-hidden mb-8">
      <div className="p-6 sm:p-8 space-y-4">
        <Skeleton className="h-10 w-56 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
