import { type Dimension2 } from 'base/geometry/dimension';
import { type Input } from 'ui/graphics/pipeline/types';

export type ResizableInput = Input & { resize: (size: Dimension2) => void };
