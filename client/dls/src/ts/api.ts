// import path from 'path';
import path from 'path-browserify';

export function apiURL(targetPath: string) {
	return new URL(path.join('/api/', targetPath), import.meta.env.VITE_API_SERVER);
}
export function actionURL(targetPath: string) {
	return new URL(path.join('/api/action', targetPath), import.meta.env.VITE_API_SERVER);
}
