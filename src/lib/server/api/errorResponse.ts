import { error } from '@/lib/common/logger';

export function apiErrorResponse(err: any) {
	error(err);
	let message = 'Something went wrong';
	if (err.message) message = err.message;

	const response = {
		success: false,
		message,
	};

	let status = 500;
	if (err.message.toLowerCase().includes('not found')) status = 404;
	if (err.message.toLowerCase().includes('bad request')) status = 400;
	if (err.message.toLowerCase().includes('not logged in')) status = 401;
	if (err.message.toLowerCase().includes('unauthorized')) status = 401;

	return new Response(JSON.stringify(response), {
		status,
		headers: {
			'content-type': 'application/json',
		},
	});
}
