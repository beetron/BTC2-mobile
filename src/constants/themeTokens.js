// Plain CommonJS so tailwind.config.js can require it; src/constants/theme.ts
// imports the same list, so the Tailwind color names and the palettes can't
// drift apart.
const TOKEN_NAMES = /** @type {const} */ ([
  "bg",
  "surface",
  "surfaceMuted",
  "border",
  "divider",
  "ink",
  "inkMuted",
  "inkSubtle",
  "primary",
  "onPrimary",
  "primarySoft",
  "danger",
  "onDanger",
  "dangerSoft",
  "badge",
  "success",
  "warning",
  "bubbleOther",
]);

module.exports = { TOKEN_NAMES };
