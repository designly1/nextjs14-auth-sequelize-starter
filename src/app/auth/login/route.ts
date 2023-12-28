// src/app/auth/login/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { User } from '@/models/associations';
import { setUserDataCookie, setJWT, checkTurnstileToken } from '@/lib/server/auth';
import { apiErrorResponse } from '@/lib/server/api/errorResponse';

export interface I_ApiUserLoginRequest {
	login: string;
	password: string;
	tsToken: string;
	code?: string;
}

export interface I_ApiUserLoginResponse extends ApiResponse {}

export const dynamic = 'force-dynamic';

// Create a POST endpoint
export async function POST(request: NextRequest) {
	const isDev = process.env.NODE_ENV === 'development';
	const body = (await request.json()) as I_ApiUserLoginRequest;

	// trim all input values
	const { login, password, tsToken } = Object.fromEntries(
		Object.entries(body).map(([key, value]) => [key, value?.trim()]),
	) as I_ApiUserLoginRequest;
	if (!login || !password) {
		const res: I_ApiUserLoginResponse = {
			success: false,
			message: 'Either login or password is missing',
		};
		return NextResponse.json(res, { status: 400 });
	}

	// We won't require Turnstile in development mode
	if (!isDev) {
		if (!tsToken) {
			const res: I_ApiUserLoginResponse = {
				success: false,
				message: 'Missing Turnstile token',
			};
			return NextResponse.json(res, { status: 400 });
		}
		const isTurnstileTokenValid = await checkTurnstileToken(tsToken);
		if (!isTurnstileTokenValid) {
			const res: I_ApiUserLoginResponse = {
				success: false,
				message: 'Invalid Turnstile token',
			};
			return NextResponse.json(res, { status: 400 });
		}
	}
	try {
		// Fetch our user from the database
		const user = await User.login(login, password);

		// Check if user is active
		if (user.status !== 'active') throw new Error('User account is not active');

		// create our response object
		const res: I_ApiUserLoginResponse = {
			success: true,
		};
		const response = NextResponse.json(res);

		// Store public user data as a cookie
		const userData = user.exportPublic();

		// Set auth cookies
		setUserDataCookie(userData);
		await setJWT(userData);

		return response;
	} catch (err: any) {
		return apiErrorResponse(err);
	}
}
