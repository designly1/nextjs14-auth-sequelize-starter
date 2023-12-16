import safe from 'colors';

export const log = (message: any, ...args: any[]) => {
	console.log(safe.bgGreen(new Date().toLocaleString()));
	console.log(safe.bgMagenta(message), ...args);
};

export const error = (message: any, ...args: any[]) => {
	console.log(safe.bgGreen(new Date().toLocaleString()));
	console.error(safe.bgRed(message), ...args);
};

export const cyan = (message: any, ...args: any[]) => {
	console.log(safe.bgGreen(new Date().toLocaleString()));
	console.log(safe.bgCyan(message), ...args);
}