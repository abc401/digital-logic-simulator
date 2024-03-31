import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@src/../tailwind.config';

export let config = resolveConfig(tailwindConfig);
