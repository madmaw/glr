import {
  type Tool,
  type ToolAttachment,
  type ToolEvent,
} from 'app/pages/edit/editor/tool/types';
import { type StaticInput } from 'ui/graphics/pipeline/static_input';
import {
  type Input,
  InputUpdateType,
} from 'ui/graphics/pipeline/types';

const DIMENSION = 8;

export class CircleToolAttachment implements ToolAttachment {
  constructor(readonly input: StaticInput<HTMLCanvasElement>) {
  }

  next({
    x,
    y,
    dragging,
  }: ToolEvent): void {
    if (!dragging) {
      return;
    }
    const ctx = this.input.target.getContext('2d');
    if (ctx == null) {
      return;
    }
    const pw = DIMENSION;
    const ph = DIMENSION;
    const px = x * ctx.canvas.width - pw / 2;
    const py = y * ctx.canvas.height - ph / 2;
    ctx.fillStyle = 'black';
    // ctx.fillRect(px, py, pw, ph);
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + ph / 2, DIMENSION / 2, 0, Math.PI * 2);
    ctx.fill();
    this.input.updates.next({
      type: InputUpdateType.Rerender,
      bounds: {
        x: px / ctx.canvas.width,
        y: py / ctx.canvas.height,
        width: pw / ctx.canvas.width,
        height: ph / ctx.canvas.height,
      },
    });
  }
}

export class CircleTool implements Tool {
  attach(input: Input): ToolAttachment {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return new CircleToolAttachment(input as StaticInput<HTMLCanvasElement>);
  }
}
