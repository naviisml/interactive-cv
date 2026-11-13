import { test } from 'node:test'
import assert from 'node:assert/strict'
import { codePreviewDocument } from '../app/game/core/codePreview.ts'

test('the restrictive preview policy precedes user HTML and CSS', () => {
  const html = '<h1>My page</h1><img src="https://example.invalid/private">'
  const css = 'h1 { color: green }'
  const document = codePreviewDocument(html, css)
  assert.ok(document.indexOf('Content-Security-Policy') < document.indexOf(css))
  assert.ok(document.indexOf('Content-Security-Policy') < document.indexOf(html))
  for (const directive of [
    "default-src 'none'",
    "script-src 'none'",
    "style-src 'unsafe-inline'",
    'img-src data:',
    "form-action 'none'",
    "base-uri 'none'",
  ])
    assert.ok(document.includes(directive), directive)
  assert.ok(document.includes(html))
  assert.ok(document.includes(css))
})
