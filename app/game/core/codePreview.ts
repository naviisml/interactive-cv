/** A read-only, opaque-origin preview. Inline CSS works; scripts, remote assets,
 * forms, nested frames and base-URL changes are blocked independently of sandbox. */
export function codePreviewDocument(html: string, css: string): string {
  const policy =
    "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none'"
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${html}</body></html>`
}
