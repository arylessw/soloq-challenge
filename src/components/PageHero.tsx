type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow = "EUW · Saison ranked", title, description }: Props) {
  return (
    <header className="page-hero pt-10">
      <div className="page-hero-orb" aria-hidden />
      {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      <svg
        viewBox="0 0 320 12"
        aria-hidden
        className="relative z-[1] mx-auto mt-1 mb-4 w-56 text-gold"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".55"
      >
        <path d="M8 6h122m60 0h122" />
        <path d="M160 1.5 164.5 6 160 10.5 155.5 6Z" fill="currentColor" stroke="none" />
        <circle cx="138" cy="6" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="182" cy="6" r="1.6" fill="currentColor" stroke="none" />
      </svg>
      {description && (
        <p className="text-muted max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      )}
    </header>
  );
}
