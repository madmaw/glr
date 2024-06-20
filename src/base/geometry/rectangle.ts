import { type Mutable } from 'base/record';

export type Rectangle2 = {
  readonly x: number,
  readonly y: number,
  readonly width: number,
  readonly height: number,
};

export type MutableRectangle2 = Mutable<Rectangle2>;
