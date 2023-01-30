import { defineConfig } from 'vite'

export default ({ mode }) => {
  return defineConfig({
    build: {
      outDir: './dist',
    }
  });
}
