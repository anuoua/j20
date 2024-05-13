import * as babelCore from "@babel/core";
import { isSignal } from "./is-signal";

const { types: t, template } = babelCore;

export const hasSignalInPattern = (
  id: babelCore.types.ObjectPattern | babelCore.types.ArrayPattern
): boolean => {
  if (t.isObjectPattern(id)) {
    return !!id.properties.find((p) => {
      if (t.isRestElement(p)) {
        if (t.isIdentifier(p.argument)) {
          return isSignal(p.argument.name);
        }
      } else {
        if (t.isIdentifier(p.key)) {
          if (t.isIdentifier(p.value)) {
            return isSignal(p.value.name);
          } else if (t.isAssignmentPattern(p.value)) {
            if (t.isIdentifier(p.value.left)) {
              return isSignal(p.value.left.name);
            } else if (
              t.isObjectPattern(p.value.left) ||
              t.isArrayPattern(p.value.left)
            ) {
              return hasSignalInPattern(p.value.left);
            }
          } else if (t.isObjectPattern(p.value) || t.isArrayPattern(p.value)) {
            return hasSignalInPattern(p.value);
          }
        }
      }
    });
  } else if (t.isArrayPattern(id)) {
    return !!id.elements.find((e) => {
      if (t.isIdentifier(e)) {
        return isSignal(e.name);
      } else if (t.isAssignmentPattern(e)) {
        if (t.isIdentifier(e.left)) {
          return isSignal(e.left.name);
        } else if (t.isObjectPattern(e.left) || t.isArrayPattern(e.left)) {
          return hasSignalInPattern(e.left);
        }
      } else if (t.isRestElement(e)) {
        return t.isIdentifier(e.argument) && isSignal(e.argument.name);
      } else if (t.isObjectPattern(e) || t.isArrayPattern(e)) {
        return hasSignalInPattern(e);
      }
    });
  } else {
    return false;
  }
};
