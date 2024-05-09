import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import {
  type ConfigEnv,
  defineConfig,
} from 'vite';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(function (env: ConfigEnv) {
  return {
    base: '',
    test: {
      include: ['**/*.test.ts?'],
      globals: true,
      environment: 'jsdom',
    },
    plugins: [
      tsconfigPaths(),
      env.mode !== 'test' && eslint({
        lintOnStart: true,
        exclude: [
          '/virtual:/**',
          '/sb-preview',
          'node_modules',
        ],
      }),
      react({
        // babel: {
        //   configFile: './.babelrc',
        // },
        babel: {
          plugins: [
            'macros',
            [
              '@babel/plugin-proposal-decorators',
              {
                version: '2023-11',
              },
            ],
            ['@babel/plugin-proposal-class-properties'],
            ['@babel/plugin-transform-class-static-block'],
          ],
          assumptions: {
            setPublicClassFields: true,
          },
        },
      }),
      lingui(),
    ],
    css: {
      devSourcemap: true,
    },
  };
});
