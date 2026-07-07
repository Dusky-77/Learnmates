# Quiz Manifest & Runtime Discovery

This project supports faster and more robust quiz discovery using build-time manifests and an optional small serverless endpoint.

## How it works

- `scripts/generateQuizManifests.js` scans `public/Questions/**` and writes:
  - `manifest.json` into each quiz folder that contains question files (e.g. `/public/Questions/.../manifest.json`)
  - a centralized index at `/public/Questions/index.json`
- `src/utils/quizLoader.ts` now tries to fetch `manifest.json` from the quiz folder first; if present, it uses that data (and optionally probes a small range beyond the manifest when `autoExpand` is enabled).
- If no manifest is found, the loader falls back to the original batched probing approach.
- (Previously there was an optional serverless runtime endpoint `api/listQuiz` to read quiz files at runtime, but it has been removed because it caused very large Vercel Serverless Functions when bundling lots of assets. The current approach uses only static files + manifests and works fully on the CDN without any backend.)

## Running locally

Node is required to run the generator script (the repo uses ESM):

```sh
# Generate manifests
node scripts/generateQuizManifests.js

# Then build (prebuild will run the generator automatically)
npm run build
```

## Notes

- If you add or change questions often, you can run the script on your CI or as a deploy hook so manifests are up-to-date.
- For runtime updates without a rebuild, prefer regenerating manifests and re-deploying, instead of using a serverless endpoint, to avoid oversized function bundles.
