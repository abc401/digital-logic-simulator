export function exportToFile(blob: Blob, filename: string) {
	const a = document.createElement('a');
	const url = URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;

	document.body.appendChild(a);
	a.click();

	setTimeout(function () {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 0);
}
