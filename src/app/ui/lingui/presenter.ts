import {
  type I18n,
  type Messages,
} from '@lingui/core';
import { type LoggingService } from 'app/services/logging';
import { expandLocales } from 'base/locale';
import {
  computed,
  observable,
  runInAction,
} from 'mobx';
import {
  type AsyncState,
  AsyncStateType,
} from 'ui/components/async/types';

class LocalesLoadError extends Error {
  constructor(locales: readonly string[], cause: unknown) {
    super(`unable to load locales: ${locales.join()}`, {
      cause,
    });
  }
}

export class LinguiPresenter {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly i18n: I18n,
  ) {
  }

  async loadLocale(
    model: LinguiModel,
    locales: readonly string[],
    loadMessages: (locale: string) => Promise<Messages>,
  ) {
    const expandedLocales = expandLocales(locales);
    runInAction(function () {
      model.pendingLocaleCount++;
    });
    // try to find a supported message
    for (const locale of expandedLocales) {
      runInAction(function () {
        model.activeLocale = locale;
      });
      try {
        if (![...(this.i18n.locales || [])].some(installedLocale => installedLocale === locale)) {
          const messages = await loadMessages(locale);
          this.i18n.load(locale, messages);
        }
        if (locale === model.activeLocale) {
          this.i18n.activate(locale);
        }
        break;
      } catch (e) {
        if (locale === expandedLocales[expandedLocales.length - 1]) {
          runInAction(function () {
            model.errored = true;
            model.pendingLocaleCount--;
            if (locale === model.activeLocale) {
              model.activeLocale = undefined;
            }
          });
          throw new LocalesLoadError(expandedLocales, e);
        } else {
          // just keep going
          this.loggingService.warn(`failed to load locale: ${locale}`, {
            error: e,
          });
        }
      }
    }
    runInAction(function () {
      model.pendingLocaleCount--;
    });
  }
}

export class LinguiModel {
  @observable.ref
  accessor activeLocale: string | undefined;

  @observable.ref
  accessor errored: boolean = false;

  @observable.ref
  accessor pendingLocaleCount: number = 0;

  @computed
  get state(): AsyncState<void, void, void> {
    if (this.errored) {
      return {
        type: AsyncStateType.Failure,
        reason: undefined,
      };
    }
    if (this.pendingLocaleCount > 0 || this.activeLocale == null) {
      return {
        type: AsyncStateType.Loading,
        progress: undefined,
      };
    }
    return {
      type: AsyncStateType.Success,
      value: undefined,
    };
  }

  constructor() {
  }
}
