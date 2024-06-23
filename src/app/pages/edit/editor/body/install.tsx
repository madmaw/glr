import { CircleTool } from 'app/pages/edit/editor/tool/circle/tool';
import { type LoggingService } from 'app/services/logging';
import { usePartialComponent } from 'base/react/partial';
import { StaticInput } from 'ui/graphics/pipeline/static_input';
import { install as installChannel } from './channel/install';
import { Skeleton } from './skeleton';

export function install({
  services,
}: {
  services: {
    loggingService: LoggingService,
  },
}) {
  const Layer = installChannel({
    services,
  });

  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'yellow');
  gradient.addColorStop(1, 'blue');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const input = new StaticInput(canvas);

  const tool = new CircleTool();
  const attachment = tool.attach(input);

  return function () {
    const Content = usePartialComponent(
      function () {
        return {
          input,
          events: attachment,
        };
      },
      [],
      Layer,
    );

    return <Skeleton Content={Content} />;
  };
}
