import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	// compilerOptions: {
	// 	dev: true
	// },

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			'@src': path.resolve('./src'),
			'@ts': path.resolve('./src/ts'),
			'@routes': path.resolve('./src/routes'),
			'@lib': path.resolve('./src/lib'),
			'@comps': path.resolve('./src/lib/components'),
			'@stores': path.resolve('./src/lib/stores')
		}
	}
};

export default config;
