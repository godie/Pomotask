/**
 * Conventional Commits: <type>(optional scope): <description>
 * Types: feat | fix | chore | docs | style | refactor | test | perf | ci | revert
 *
 * Bad:  "configuration: update ci"  → "configuration" is not a valid type
 * Good: "chore: update ci and documentation"
 */
export default {
  extends: ['@commitlint/config-conventional'],
  helpUrl:
    'https://www.conventionalcommits.org/en/v1.0.0/#summary',
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'style',
        'refactor',
        'test',
        'perf',
        'ci',
        'revert',
      ],
    ],
    // Off: allow subject to end with . or not
    'subject-full-stop': [0],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 100],
  },
}