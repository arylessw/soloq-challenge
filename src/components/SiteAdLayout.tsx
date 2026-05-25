"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { SideAdRail } from "@/components/SideAdRail";
import { adsEnabled, getAdSenseClient, hasAdSense } from "@/lib/ads-config";

const NO_ADS_PREFIXES = ["/admin"];

export function SiteAdLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showAds =
    adsEnabled() && !NO_ADS_PREFIXES.some((p) => pathname.startsWith(p));

  if (!showAds) {
    return <>{children}</>;
  }

  const adClient = getAdSenseClient();

  return (
    <div className="site-ad-layout">
      {hasAdSense() && adClient && (
        <Script
          id="adsense-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      )}
      <SideAdRail position="left" />
      <div className="site-ad-content">{children}</div>
      <SideAdRail position="right" />
    </div>
  );
}
