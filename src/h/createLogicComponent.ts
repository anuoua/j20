import { computed } from '../api/computed'

export const createLogicComponent = (tag: FC, props: undefined | (() => any), children: undefined | (() => any)) => {
  return tag(computed(() => ({
    ...props?.(),
    get children() {
      return children?.();
    }
  })));
};
