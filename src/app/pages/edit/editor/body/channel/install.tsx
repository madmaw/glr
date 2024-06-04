import { Placeholder } from 'ui/components/placeholder';

export function install() {
  return function () {
    return (
      <Placeholder
        minWidth={50}
        minHeight={40}
      />
    );
  };
}
