/** lint-staged v15+: only glob → command(s). No top-level `ignore` (deprecated). */
export default {
  '*.{ts,tsx}': [
    'eslint --max-warnings 0 --fix --no-warn-ignored',
    'bash -c \'tsc --noEmit\'',
  ],
  '*.{json,md,yml,yaml}': ['prettier --write'],
}
