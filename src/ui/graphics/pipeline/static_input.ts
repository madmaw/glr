import { Subject } from 'rxjs';
import {
  type Input,
  type InputUpdate,
} from './types';

export class StaticInput<
  Target extends HTMLImageElement | HTMLCanvasElement = HTMLImageElement | HTMLCanvasElement,
> implements Input {
  readonly updates = new Subject<InputUpdate>();

  constructor(readonly target: Target) {
  }
}
