import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['en'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/src/app/pages/example/locales/{locale}',
      include: ['src/app/pages/example/**/*.tsx'],
    },
  ],
};

export default config;
