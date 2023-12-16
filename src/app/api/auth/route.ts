import { User } from '@/models/associations';
import { NextRequest } from 'next/server';
import { setUserDataCookie, logout } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api/errorResponse';

import { I_UserPublic } from '@/models/User.types';

export interface I_ApiAuthResponse extends ApiResponse {
	user?: I_UserPublic;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	try {
		const user = await User.getAuthUserFromDb();
		if (!user) throw new Error('User not found');

		// Update last seen timesamp and save
		user.lastSeen = new Date();
		await user.save();
		const userData = user.exportPublic();
		const response: I_ApiAuthResponse = {
			success: true,
			user: userData,
		};

		// Refresh our userdata cookie in case information was changed elsewhere
		setUserDataCookie(userData);
		return new Response(JSON.stringify(response), {
			headers: {
				'content-type': 'application/json',
			},
		});
	} catch (err: any) {
		return apiErrorResponse(err);
	}
}
