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
      {description && (
        <p className="text-muted max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      )}
    </header>
  );
}
