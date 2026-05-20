import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './openapi.json',
  output: {
    path: './app/services/',
  },
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/client-fetch',
      throwOnError: true,
    },
    {
      name: '@hey-api/sdk',
      responseStyle: 'data',
    },
  ],
})
