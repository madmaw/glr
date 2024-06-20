import { type Dimension2 } from 'base/geometry/dimension';
import { checkUnary } from 'base/preconditions';
import { type ReadonlyRecord } from 'base/record';
import {
  type Arrays,
  type BufferInfo,
  createBufferInfoFromArrays,
  createProgramInfoAsync,
  createTexture,
  drawBufferInfo,
  type ProgramInfo,
  setBuffersAndAttributes,
  setUniforms,
} from 'twgl.js';
import {
  AbstractStep,
  type Input,
} from './types';

export type UniformParameter =
  // TODO texture
  // int/float
  | number
  // v1
  | [number]
  // v2
  | [number, number]
  // v3
  | [number, number, number]
  // v4
  | [number, number, number, number]
  // m3
  | [
    number,
    number,
    number,

    number,
    number,
    number,

    number,
    number,
    number,
  ]
  // m4
  | [
    number,
    number,
    number,
    number,

    number,
    number,
    number,
    number,

    number,
    number,
    number,
    number,

    number,
    number,
    number,
    number,
  ];

type UniformParameters<K extends string | number | symbol = string> = Partial<Record<K, UniformParameter>>;
type InputParameters<K extends string | number | symbol = string> = Partial<Record<K, Input>>;

type Shader<Parameters extends ReadonlyRecord<string, string>> = {
  readonly shaders: readonly {
    readonly name: string,
    readonly contents: string,
  }[],
  readonly renaming: Parameters,
};

export class FlatGLSLStepDefinition<
  VertexParameters extends ReadonlyRecord<string, string>,
  FragmentParameters extends ReadonlyRecord<string, string>,
  Inputs extends InputParameters<keyof VertexParameters | keyof FragmentParameters>,
  Parameters extends UniformParameters<keyof VertexParameters | keyof FragmentParameters>,
> {
  constructor(
    private readonly vertexShader: Shader<VertexParameters>,
    private readonly fragmentShader: Shader<FragmentParameters>,
  ) {
  }

  async createStep(
    inputs: Inputs,
    parameters: Parameters,
    size: Dimension2,
  ): Promise<FlatGLSLStep<Inputs, Parameters>> {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl == null) {
      throw new Error('no webgl');
    }
    const programInfo: ProgramInfo = await createProgramInfoAsync(gl, [
      checkUnary(this.vertexShader.shaders, 'expected only one vertex source file').contents,
      checkUnary(this.fragmentShader.shaders, 'expected only one fragment source file').contents,
    ]);
    const arrays: Arrays = {
      a_position: {
        numComponents: 3,
        data: [
          // 0
          1,
          1,
          0,
          // 1
          -1,
          1,
          0,
          // 2
          -1,
          -1,
          0,
          // 3
          1,
          -1,
          0,
        ],
      },
      a_textureCoord: {
        numComponents: 2,
        data: [
          // 0
          1,
          0,
          // 1
          0,
          0,
          // 2
          0,
          1,
          // 3
          1,
          1,
        ],
      },
      indices: {
        numComponents: 3,
        data: [
          // 0
          0,
          1,
          2,
          // 1
          0,
          2,
          3,
        ],
      },
    };
    const bufferInfo = createBufferInfoFromArrays(gl, arrays);
    gl.useProgram(programInfo.program);
    gl.enable(gl.CULL_FACE);
    // already default
    // gl.cullFace(gl.BACK);

    const step = new FlatGLSLStep<Inputs, Parameters>(
      canvas,
      gl,
      programInfo,
      bufferInfo,
      inputs,
    );
    step.doResizeTargetWithoutRendering(size);
    step.doUpdateTargetWithoutRendering(parameters);
    step.render();
    return step;
  }
}

class FlatGLSLStep<
  Inputs extends InputParameters,
  Parameters extends UniformParameters,
> extends AbstractStep<InputParameters, Parameters> {
  protected get width(): number {
    return this.target.width;
  }

  protected get height(): number {
    return this.target.height;
  }

  constructor(
    readonly target: HTMLCanvasElement,
    private readonly gl: WebGLRenderingContext,
    private readonly programInfo: ProgramInfo,
    private readonly bufferInfo: BufferInfo,
    inputs: Inputs,
  ) {
    super(inputs);
    // set the image uniforms
    const inputUniforms = Object
      .entries(this.inputs)
      .reduce<Partial<Record<keyof Input, WebGLTexture>>>(
        function (acc, [
          key,
          input,
        ]) {
          if (input != null) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            acc[key as keyof Input] = createTexture(
              gl,
              {
                src: input.target,
                min: gl.NEAREST,
                mag: gl.NEAREST,
              },
            );
          }
          return acc;
        },
        {},
      );
    setUniforms(programInfo, inputUniforms);
  }

  override doUpdateTarget(parameters: Parameters): void {
    this.doUpdateTargetWithoutRendering(parameters);
    this.render();
  }

  doUpdateTargetWithoutRendering(parameters: Parameters): void {
    setUniforms(this.programInfo, parameters);
  }

  override doResizeTarget(size: Dimension2): void {
    this.doResizeTargetWithoutRendering(size);
    this.render();
  }

  doResizeTargetWithoutRendering({
    width,
    height,
  }: Dimension2) {
    this.target.width = width;
    this.target.height = height;
    this.gl.viewport(0, 0, width, height);
    // TODO move into subclass
    setUniforms(this.programInfo, {
      u_aspect_ratio: [
        width / height,
        1,
        1,
      ],
      // TODO camera
    });
  }

  render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
    drawBufferInfo(this.gl, this.bufferInfo);
  }
}
