import { type LoggingService } from 'app/services/logging';
import { useAsyncEffect } from 'base/react/async';
import {
  usePartialComponent,
  usePartialObserverComponent,
} from 'base/react/partial';
import { useMemo } from 'react';
import { type PartialObserver } from 'rxjs';
import { AsyncBoundaryDelegate } from 'ui/components/async/boundary';
import { type Input } from 'ui/graphics/pipeline/types';
import {
  type InputEvents,
  InputView,
} from './input_view';
import {
  ChannelModel,
  ChannelPresenter,
} from './presenter';
import { type ResizableInput } from './types';

export function install({
  services: {
    loggingService,
  },
}: {
  services: {
    loggingService: LoggingService,
  },
}) {
  const presenter = new ChannelPresenter();
  return function ({
    input,
    scrollContainer,
  }: { input: Input, scrollContainer: HTMLElement | null }) {
    const model = useMemo(function () {
      return new ChannelModel(input);
    }, [input]);
    useAsyncEffect(async function () {
      try {
        await presenter.load(model);
      } catch (e) {
        loggingService.errorException(e);
      }
    }, [model]);

    const Component = usePartialObserverComponent(
      function () {
        return {
          state: model.state,
        };
      },
      [model],
      AsyncBoundaryDelegate<ResizableInput>,
    );

    const events = useMemo<PartialObserver<InputEvents>>(function () {
      return {
        next: function (e) {
          console.log(e);
        },
      };
    }, []);

    const Success = usePartialComponent(
      function ({ value }: { value: ResizableInput }) {
        return {
          input: value,
          aspectRatio: input.target.width / input.target.height,
          scale: input.target.width,
          events,
        };
      },
      [
        input,
        events,
      ],
      InputView,
    );

    return (
      <Component
        Success={Success}
      />
    );
  };
}
