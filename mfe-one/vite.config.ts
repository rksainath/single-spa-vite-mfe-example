import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginSingleSpa from 'vite-plugin-single-spa';

export default defineConfig({
    plugins: [
        react(),
        vitePluginSingleSpa({
            serverPort: 4101,
            spaEntryPoints: 'src/spa.tsx',
            cssStrategy: 'multiMife',
        }),
    ],
});
