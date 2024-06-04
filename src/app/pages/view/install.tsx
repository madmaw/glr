import { type PageProps } from 'app/pages/types';
import { type Services } from 'app/services/types';
import { type LinguiProvider } from 'app/ui/lingui/types';

export function install({ services }: {
  services: Services,
  LinguiProvider: LinguiProvider,
}) {
  return function (props: PageProps) {
    return <div />;
  };
}
