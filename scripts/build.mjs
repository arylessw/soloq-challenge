import { execSync } from "node:child_process";

const dbUrl = process.env.DATABASE_URL?.trim();

if (!dbUrl) {
  console.error("");
  console.error("❌ DATABASE_URL manquante — le build Vercel ne peut pas continuer.");
  console.error("");
  console.error("1. Va sur vercel.com → ton projet SoloQ → Settings → Environment Variables");
  console.error("2. Ajoute :");
  console.error("     Nom   : DATABASE_URL");
  console.error("     Valeur: connection string Neon (postgresql://...?sslmode=require)");
  console.error("3. Coche Production, Preview et Development");
  console.error("4. Save → Redeploy");
  console.error("");
  console.error("Connection string : neon.tech → ton projet → Connection details → Copy");
  console.error("");
  process.exit(1);
}

execSync("node scripts/prisma-generate.mjs", { stdio: "inherit" });
execSync("prisma migrate deploy", { stdio: "inherit", env: process.env });
execSync("next build", { stdio: "inherit", env: process.env });
