import { CompteLayoutShell } from "@/components/CompteLayoutShell";

export default function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CompteLayoutShell>{children}</CompteLayoutShell>;
}
