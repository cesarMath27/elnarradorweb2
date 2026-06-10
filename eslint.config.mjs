import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-config-next 15.x no expone config plana; FlatCompat hace el puente
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "out/**",
      "build/**",
      "deploy/**",
      "deploy-pages/**",
      "deploy_me/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
