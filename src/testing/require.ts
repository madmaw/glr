import { type Messages } from '@lingui/core';
import { checkExists } from 'base/preconditions';

type Module<T> = { exports?: T };

class HTTPError extends Error {
  constructor(readonly statusCode: number, message: string) {
    super(message);
  }
}

// specifically written to retrieve LingUI messages from storybook, which doesn't support
// CommonJS modules. Don't use for anything else
export async function requireTranslations<T = { messages: Messages }>(path: string, prefix = '/src/'): Promise<T> {
  const request = new XMLHttpRequest();
  request.open('GET', prefix + path);
  request.responseType = 'text';
  return new Promise<T>(function (resolve, reject) {
    request.onerror = function () {
      reject(new HTTPError(request.status, request.statusText));
    };
    request.onload = function () {
      const js: string = request.response;
      try {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const f = new Function('module', js) as (module: Module<T>) => void;
        const module: Module<T> = {};
        f(module);
        const result = checkExists(module.exports, 'module should export something');
        resolve(result);
      } catch (e) {
        reject(e);
      }
    };
    request.send();
  });
}
