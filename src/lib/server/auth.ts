import { jwtVerify, JWTPayload, decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import authConfig from '@/config/authConfig';

import { I_UserPublic } from '@/models/User.types';

export function getJwtSecretKey() {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw new Error('JWT Secret key is not set');
	}

	const enc: Uint8Array = new TextEncoder().encode(secret);
	return enc;
}

export async function verifyJwtToken(token: string): Promise<JWTPayload | null> {
	try {
		const { payload } = await jwtVerify(token, getJwtSecretKey());

		return payload;
	} catch (error) {
		return null;
	}
}

export function decodeJwtToken(token: string): JWTPayload | null {
	try {
		const { payload } = decodeJwt(token) as { payload: JWTPayload };

		return payload;
	} catch (error) {
		return null;
	}
}

export async function getJwt() {
	const cookieStore = cookies();
	const token = cookieStore.get('token');

	if (token) {
		try {
			const payload = decodeJwt(token.value);
			if (payload) {
				const authPayload: AuthPayload = {
					id: payload.id as string,
					firstName: payload.firstName as string,
					lastName: payload.lastName as string,
					email: payload.email as string,
					phone: payload.phone as string,
					role: payload.role as string,
					iat: payload.iat as number,
					exp: payload.exp as number,
					openIdSub: payload.openIdSub as string,
				};
				return authPayload;
			}
		} catch (error) {
			return null;
		}
	}
	return null;
}

export function getUserDataServer() {
	try {
		const cookieStore = cookies();
		const cookieData = cookieStore.get('userData');
		if (!cookieData) return null;

		return JSON.parse(cookieData.value);
	} catch (_) {
		return null;
	}
}

export async function logout() {
	const cookieStore = cookies();
	const token = cookieStore.get('token');

	if (token) {
		try {
			cookieStore.delete('token');
		} catch (_) {}
	}

	const userData = cookieStore.get('userData');
	if (userData) {
		try {
			cookieStore.delete('userData');
			return true;
		} catch (_) {}
	}

	return null;
}

export function setUserDataCookie(userData: I_UserPublic) {
	const cookieStore = cookies();

	cookieStore.set({
		name: 'userData',
		value: JSON.stringify(userData),
		path: '/',
		maxAge: authConfig.jwtExpires,
		sameSite: 'strict',
	});
}

interface I_TurnstileResponse {
	success: boolean;
}

export async function checkTurnstileToken(token: string) {
	const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

	const formData = new FormData();
	formData.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
	formData.append('response', token);

	try {
		const result = await fetch(url, {
			body: formData,
			method: 'POST',
		});

		const outcome = (await result.json()) as I_TurnstileResponse;
		if (outcome.success) {
			return true;
		}
	} catch (err) {
		console.error(err);
	}
	return false;
}
