/**
 * Prevent a serialized document from terminating an inline script element.
 * This is required even when a CSP hash is present: HTML parsing happens
 * before JavaScript parsing and before the script can enforce anything.
 */
export function escapeInlineScript(text) {
  return text.replace(/<\/script/gi, "<\\/script");
}
