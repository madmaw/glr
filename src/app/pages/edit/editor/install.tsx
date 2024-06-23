import { type MutableDocument } from 'app/domain/model';
import { type Services } from 'app/services/types';
import { install as installBody } from './body/install';
import { install as installLayers } from './layers/install';
import { install as installMenu } from './menu/install';
import { Skeleton } from './skeleton';
import { install as installStatusBar } from './status/install';
import { install as installTools } from './tool/install';

export function install({ services }: { services: Services }) {
  // TODO selection
  const Menu = installMenu();
  const Layers = installLayers();
  const Body = installBody({
    services,
  });
  const Tools = installTools();
  const StatusBar = installStatusBar();

  return function ({ document }: { document: MutableDocument }) {
    return (
      <Skeleton
        RHSPanel={Layers}
        LHSPanel={Tools}
        Body={Body}
        Header={Menu}
        Footer={StatusBar}
      />
    );
  };
}
