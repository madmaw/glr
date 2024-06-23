import { type Input } from 'ui/graphics/pipeline/types';

export type ToolEvent = {
  readonly dragging: boolean,
  readonly x: number,
  readonly y: number,
};

export type Tool = {
  attach(input: Input): ToolAttachment,
};

export type ToolAttachment = {
  next(e: ToolEvent): void,
};
