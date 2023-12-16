import { logout } from '@/lib/server/auth';

export async function GET() {
	await logout();

	const response: ApiResponse = {
		success: true,
		message: 'Logged out successfully',
	};

	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
