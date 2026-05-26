import Image from "next/image";

type Props = {
  displayName: string;
  avatarUrl: string | null;
  size?: number;
  className?: string;
};

const frameClass =
  "relative inline-flex shrink-0 overflow-hidden rounded-full border border-gold/25 bg-surface";

export function UserAvatar({
  displayName,
  avatarUrl,
  size = 36,
  className = "",
}: Props) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      <span
        className={`${frameClass} ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          key={avatarUrl}
          src={avatarUrl}
          alt={displayName}
          fill
          className="object-cover object-center"
          sizes={`${size}px`}
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-display text-gold-light shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.4) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
