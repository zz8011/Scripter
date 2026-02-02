import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "prettier" // 禁用与 Prettier 冲突的 ESLint 规则
  ),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@next/next/no-sync-scripts': 'warn',
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'warn',
      'prettier/prettier': 'warn', // 将 Prettier 问题报告为警告
    },
  },
  {
    // 忽略的文件
    ignores: ['.next/**/*', 'node_modules/**/*', 'drizzle/**/*', 'dist/**/*'],
  },
];

export default eslintConfig;
