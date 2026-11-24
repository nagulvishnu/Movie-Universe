import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextCoreWebVitals,
  // movies/ holds independent applications with their own tooling; scripts/ is plain Node.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "movies/**", "scripts/**", "public/**"]),
]);
