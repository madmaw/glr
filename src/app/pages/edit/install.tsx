import { type Messages } from '@lingui/core';
import { type MutableDocument } from 'app/domain/model';
import {
  type EditRoute,
  type PageProps,
} from 'app/pages/types';
import { type Services } from 'app/services/types';
import { type LinguiProvider } from 'app/ui/lingui/types';
import { delay } from 'base/delay';
import { usePartialObserverComponent } from 'base/react/partial';
import {
  useEffect,
  useMemo,
} from 'react';
import { AsyncBoundaryDelegate } from 'ui/components/async/boundary';
import { install as installEditor } from './editor/install';
import {
  EditModel,
  EditPresenter,
} from './presenter';

async function defaultLoadMessages(locale: string) {
  await delay(400);
  return import(`./locales/${locale}.po`);
}

export function install({
  services,
  LinguiProvider,
  loadMessages = defaultLoadMessages,
}: {
  services: Services,
  LinguiProvider: LinguiProvider,
  // make loadMessages parameterized so storybook can override, otherwise never override
  loadMessages?: (locale: string) => Promise<Messages>,
}) {
  // TODO install the editor chunk dynamically on render
  const EditorImpl = installEditor({ services });
  const {
    documentService,
    loggingService,
  } = services;
  const presenter = new EditPresenter(
    documentService,
    loggingService,
  );

  function Editor({ value }: { value: MutableDocument }) {
    return <EditorImpl document={value} />;
  }

  return function ({
    locales,
    route: {
      documentId,
    },
  }: PageProps<EditRoute>) {
    const model = useMemo(function () {
      return new EditModel(documentId);
    }, [documentId]);
    useEffect(function () {
      presenter.loadDocument(model);
    }, [model]);

    // TODO may be a good idea to have a custom loading component for this
    const AsyncEditor = usePartialObserverComponent(function () {
      return {
        state: model.state,
        Success: Editor,
      };
    }, [model], AsyncBoundaryDelegate<MutableDocument>);

    // load the locale info and the document
    return (
      <LinguiProvider
        loadMessages={loadMessages}
        locales={locales}
      >
        <AsyncEditor />
      </LinguiProvider>
    );
  };
}
