import { createSimplePartialComponent } from 'base/react/partial';
import {
  Direction,
  LinearLayout,
} from './internal/linear_layout';

export const Row = createSimplePartialComponent(LinearLayout, { direction: Direction.Row });
export const Column = createSimplePartialComponent(LinearLayout, { direction: Direction.Column });
