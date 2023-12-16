// src/app/auth/login/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { User } from '@/models/associations';
import { SignJWT } from 'jose';
import * as log from '@/lib/common/logger';
import { getJwtSecretKey, setUserDataCookie, checkTurnstileToken } from '@/lib/server/auth';
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

		/** Check TFA status, reject login and send code */
		// Create and sign our JWT
		const token = await new SignJWT({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			phone: user.phone,
			role: user.role,
		})
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime(`${User.jwtExpires}s`)
			.sign(getJwtSecretKey());

		// create our response object
		const res: I_ApiUserLoginResponse = {
			success: true,
		};
		const response = NextResponse.json(res);

		// Store our JWT as a secure, HTTP-only cookie
		response.cookies.set({
			name: 'token',
			value: token,
			path: '/', // Accessible site-wide
			maxAge: 86400, // 24-hours or whatever you like
			httpOnly: true, // This prevents scripts from accessing
			sameSite: 'strict', // This does not allow other sites to access
		});

		// Store public user data as a cookie
		const userData = user.exportPublic();
		setUserDataCookie(userData);
		return response;
	} catch (err: any) {
		return apiErrorResponse(err);
	}
}
