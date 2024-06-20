import { Subject } from 'rxjs';
import {
  type Input,
  type InputUpdate,
} from './types';

export class StaticInput implements Input {
  readonly updates = new Subject<InputUpdate>();

  constructor(readonly target: HTMLImageElement | HTMLCanvasElement) {
  }
}
