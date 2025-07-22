export const wrapped = <T>(initial: () => T) => ({
  get value() {
    return initial();
  },
});
