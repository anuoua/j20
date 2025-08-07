import { effect as innerEffect } from '@preact/signals-core'
import { getCurrentInstance } from '../h/instance'

export const effect: typeof innerEffect = (...args) => {
    const currentInstance = getCurrentInstance();
    const disposes = innerEffect(...args);
    currentInstance?.disposes?.push(disposes);
    return disposes;
}