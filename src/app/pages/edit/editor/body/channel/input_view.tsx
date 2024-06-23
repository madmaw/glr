import styled from '@emotion/styled';
import {
  type PropsWithEvents,
  useEvents,
} from 'base/react/rxjs';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  map,
  pipe,
} from 'rxjs';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { type ResizableInput } from './types';

const Centerer = styled(Aligner)<{ minWidth: number, minHeight: number }>`
  min-height: ${({ minHeight }) => minHeight}px;
  min-width: ${({ minWidth }) => minWidth}px;
`;

export const enum InputEventType {
  Pointer,
}

export type InputEventPointer = {
  readonly type: InputEventType.Pointer,
  readonly dragging: boolean,
  readonly x: number,
  readonly y: number,
};

export type InputEvents = InputEventPointer;

export type InputViewProps = PropsWithEvents<InputEvents, {
  readonly input: ResizableInput,
  readonly aspectRatio: number,
  readonly scale: number,
}>;

export function InputView({
  input,
  aspectRatio,
  scale,
  events,
}: InputViewProps) {
  const [
    ref,
    setRef,
  ] = useState<HTMLDivElement | null>(null);
  const [
    width,
    height,
  ] = useMemo(function () {
    return [
      scale,
      scale / aspectRatio,
    ];
  }, [
    aspectRatio,
    scale,
  ]);

  const mouseOperator = useMemo(function () {
    return pipe(
      map<MouseEvent, InputEventPointer>(function ({
        offsetX,
        offsetY,
        buttons,
      }) {
        return {
          type: InputEventType.Pointer,
          dragging: !!(buttons & 1),
          x: offsetX / scale,
          y: offsetY * aspectRatio / scale,
        };
      }),
    );
  }, [
    scale,
    aspectRatio,
  ]);

  useEvents(
    'mousedown',
    mouseOperator,
    events,
    input.target,
  );
  useEvents(
    'mouseup',
    mouseOperator,
    events,
    input.target,
  );
  useEvents(
    'mousemove',
    mouseOperator,
    events,
    input.target,
  );

  // doesn't belong here
  // const onResize = useCallback(function () {
  //   if (scrollContainer != null) {
  //     const scrollContainerWidth = scrollContainer.clientWidth;
  //     const scrollContainerHeight = scrollContainer.clientHeight;
  //     const scrollContainerAspectRatio = scrollContainerWidth / scrollContainerHeight;
  //     const [
  //       width,
  //       height,
  //     ] = scrollContainerAspectRatio > aspectRatio
  //       ? [
  //         scrollContainerWidth / scrollContainerAspectRatio * zoom,
  //         scrollContainerHeight * zoom,
  //       ]
  //       : [
  //         scrollContainerWidth * zoom,
  //         scrollContainerHeight * scrollContainerAspectRatio * zoom,
  //       ];
  //     setWidthAndHeight([
  //       width,
  //       height,
  //     ]);
  //   }
  // }, [
  //   zoom,
  //   scrollContainer,
  //   aspectRatio,
  // ]);

  // add the input target directly
  useEffect(function () {
    if (ref != null) {
      while (ref.firstElementChild) {
        ref.removeChild(ref.firstElementChild);
      }
      ref.appendChild(input.target);
    }
  }, [
    input,
    ref,
  ]);

  // respond to resize events
  // useEffect(function () {
  //   window.addEventListener('resize', onResize);
  //   // pretty sure this doesn't do anything, but would be nice if it did
  //   // container?.addEventListener('resize', onResize);
  //   onResize();
  //   return function () {
  //     window.removeEventListener('resize', onResize);
  //     // container?.removeEventListener('resize', onResize);
  //   };
  // }, [onResize]);

  useEffect(function () {
    input.resize({
      width,
      height,
    });
  }, [
    input,
    width,
    height,
  ]);

  // TODO respond to scroll events and re-render visible area
  return (
    <Centerer
      ref={setRef}
      xAlignment={Alignment.Middle}
      yAlignment={Alignment.Middle}
      minWidth={width}
      minHeight={height}
    />
  );
}
