import {
  GenericAsyncModel,
  GenericAsyncPresenter,
} from 'ui/components/async/generic';
import copyFragmentShader from 'ui/graphics/pipeline/copy.fragment.json';
import flatFixedVertexShader from 'ui/graphics/pipeline/flat_fixed.vertex.json';
import { FlatGLSLStepDefinition } from 'ui/graphics/pipeline/flat_glsl_step';
import { type Input } from 'ui/graphics/pipeline/types';
import { type ResizableInput } from './types';

export class ChannelPresenter extends GenericAsyncPresenter<ResizableInput, ChannelModel> {
  // TODO custom implementation that allows panning
  private readonly definition = new FlatGLSLStepDefinition(
    flatFixedVertexShader,
    copyFragmentShader,
  );

  protected doLoadValue(model: ChannelModel) {
    const input = model.input;
    return this.definition.createStep(
      {
        texture: input,
      },
      {
        u_transform: [
          // 1
          1,
          0,
          0,
          // 2
          0,
          1,
          0,
          // 3
          0,
          0,
          1,
        ],
      },
      {
        width: input.target.width,
        height: input.target.height,
      },
    );
  }
}

export class ChannelModel extends GenericAsyncModel<ResizableInput> {
  constructor(readonly input: Input) {
    super();
  }
}
