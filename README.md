# Example ModelFusion provider implementation

Implements Stability AI as an "example" image provider.

## Running examples

Configure `examples/.env` with your `STABILITY_API_KEY`.

```sh
npm run dist
cd dist
npm link
cd ../examples
npm link modelfusion-example-provider
npx tsx src/generate-image-example.ts
```
