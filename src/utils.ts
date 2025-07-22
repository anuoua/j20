export const isEvent = (eventName: string) => {
  return eventName.startsWith("on");
};

export const getEventName = (eventName: string) => {
  return eventName.slice(2).toLocaleLowerCase();
};

let overflow = "";
let count = 0;

export const generateId = () => {
  if (count === Number.MAX_SAFE_INTEGER) {
    overflow += count.toString(32);
    count = 0;
  }
  return `${overflow}${(count++).toString(32)}`;
};

export const range = function* (start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
};
