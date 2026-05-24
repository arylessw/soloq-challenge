import { execSync } from "node:child_process";

const placeholder =
  "postgresql://build:build@127.0.0.1:5432/build?schema=public";

execSync("prisma generate", {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL ?? placeholder,
  },
});
