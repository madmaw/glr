import { install as installLayer } from './channel/install';
import { Skeleton } from './skeleton';

export function install() {
  const Layer = installLayer();

  return function () {
    return <Skeleton Content={Layer} />;
  };
}
