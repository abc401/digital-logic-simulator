// import path from 'path';
import path from 'path-browserify';

export function makeApiURL(targetPath: string) {
	return new URL(path.join('/api/', targetPath), import.meta.env.VITE_API_SERVER);
}
