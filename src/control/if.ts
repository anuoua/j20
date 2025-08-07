import { JSX } from "../../jsx";
import { computed } from "../api/computed"
import { createComponent } from "../h/createComponent";
import { List } from "./list";

export interface IfProps {
    of: any,
    children: JSX.Element | ((t: true) => JSX.Element),
    else: JSX.Element | ((t: false) => JSX.Element),
}

interface IfPropsInner {
    value: IfProps
}

export const If = (p: IfProps) => {
    const arr = computed(() => !(p as unknown as IfPropsInner).value.of ? [1] : [0]);

    return createComponent(List, computed(() => ({
        of: arr.value,
        children: (bool: {
            value: 1 | 0
        }) => {
            const props = (p as unknown as IfPropsInner).value;
            if (bool.value) {
                if (typeof props.children === "function") {
                    return props.children(true);
                } else {
                    return props.children;
                }
            } else {
                if (typeof props.else === "function") {
                    return props.else(false);
                } else {
                    return props.else;
                }
            }
        },
    })))
}