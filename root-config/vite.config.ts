import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginSingleSpa from 'vite-plugin-single-spa';

export default defineConfig({
    plugins: [
        react(),
        vitePluginSingleSpa({
            type: 'root',
            imo: true,
            importMaps: {
                dev: 'src/importMap.dev.json',
                build: 'src/importMap.json',
            },
        }),
    ],
    server: {
        port: 9000,
    },
});
