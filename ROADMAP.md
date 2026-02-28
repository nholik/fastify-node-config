# Roadmap

## Proposed Enhancements (prioritized)

### Medium Impact
- Add `fastify` as a peer dependency with a supported range to enforce compatibility.
- Export the plugin options type from `src/index.ts` to improve TypeScript ergonomics.

### Low Impact
- Add a `files` list in `package.json` to limit published artifacts to `dist`, `README.md`, `LICENSE`, and `package.json`.
- Add an `engines` field to document the supported Node versions.

## Completed

### Enhancements
- Add an `exports` map in `package.json` (`import`/`require`/`types`) to ensure Node ESM resolves to `dist/esm` and CJS to `dist/cjs`. (done)
- Allow passing a custom Ajv instance or options (e.g., `ajv` or `ajvOptions`) to support formats/keywords and control validation mutation behavior. (done)
- Add a `decoratorName` option (default `config`) to avoid collisions with other plugins and support multiple config decorations. (done)

### High Risk
- Make config leaf properties enumerable (and optionally configurable) so `Object.keys`/`JSON.stringify` include values. (done)
- Treat only plain objects as nested; keep arrays/special objects as leaf getters to avoid breaking semantics. (done)

### Medium Risk
- Guard symbol property access in the proxy `get` trap to avoid errors during inspection/logging. (done)
- Validate against a plain object (or make AJV mutation options configurable) to avoid mutating a proxy. (done)

### Low Risk
- Fix the Ajv link text/URL mismatch in `README.md`. (done)
- Fix the repository URL format in `package.json`. (done)

### Testing Gaps
- Add tests that confirm enumeration/serialization sees leaf properties. (done)
- Add tests covering arrays/non-plain objects in config values. (done)
- Add tests for symbol-key access when `safe` is true. (done)

### Questions / Assumptions
- Confirm whether `safe` should default to `true` or `false`. (done; default is `false`)
