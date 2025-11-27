import { getCurrentInstance } from "../h/instance";

/**
 * 获取当前实例的 id
 * @returns 当前实例的 id，如果没有实例则返回 undefined
 */
export const id = () => {
  return getCurrentInstance()?.id;
};
