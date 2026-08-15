---
"j20": patch
---

fix: controlled form props (`value`/`checked`/`selected`) now update via DOM property

The `value` content attribute only represents an input's *default* value — once
the user has typed (dirty value flag set), `setAttribute("value", ...)` no
longer updates the actual value, so controlled inputs could not be cleared or
reset programmatically. The same applies to `checked` and `selected`. These
keys are now written as DOM properties (like React does for controlled
components); everything else still goes through attributes.
