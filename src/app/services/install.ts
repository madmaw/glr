import { rollup } from 'base/record';
import { createDeferredServices } from './deferred';
import { install as installLocal } from './local/install';
import {
  type Services,
  type ServicesDescriptor,
} from './types';

export function install({ descriptors }: { descriptors: ServicesDescriptor }): Services {
  const immediateServices: Partial<Services> = {};
  const deferredServices = createDeferredServices(immediateServices);

  const localServices = installLocal({
    services: deferredServices,
    descriptors,
  });
  return rollup(
    immediateServices,
    localServices,
  );
}
