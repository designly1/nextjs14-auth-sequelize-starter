// pnpm i cookie \ pnpm i -D @types/cookie
import cookie from 'cookie';
import { I_UserPublic } from '@/models/User.types';

export function getUserData() {
	const cookies = cookie.parse(document.cookie);
	const { userData } = cookies;

	// Check if userData exists and is a string
	if (!userData || typeof userData !== 'string') return null;

	try {
		return JSON.parse(userData) as I_UserPublic;
	} catch (error) {
		return null;
	}
}

export function isLoggedIn() {
	const userData = getUserData();
	return !!userData;
}
