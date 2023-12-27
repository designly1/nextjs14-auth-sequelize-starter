import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/server/auth';

// Add whatever paths you want to PROTECT here
const authRoutes = ['/app/*', '/account/*', '/api/*', '/admin/*'];

// Function to match the * wildcard character
function matchesWildcard(path: string, pattern: string): boolean {
	if (pattern.endsWith('/*')) {
		const basePattern = pattern.slice(0, -2);
		return path.startsWith(basePattern);
	}
	return path === pattern;
}

// Function to delete auth cookies and redirect
function deleteCookiesAndRedirect(url: string) {
	const response = NextResponse.redirect(url);
	response.cookies.delete('token');
	response.cookies.delete('userData');
	return response;
}

export async function middleware(request: NextRequest) {
	// Shortcut for our login path redirect
	// Note: you must use absolute URLs for middleware redirects
	const LOGIN = `${process.env.NEXT_PUBLIC_BASE_URL}/login?redirect=${
		request.nextUrl.pathname + request.nextUrl.search
	}`;
	if (authRoutes.some(pattern => matchesWildcard(request.nextUrl.pathname, pattern))) {
		const token = request.cookies.get('token');
		// For API routes, we want to return unauthorized instead of
		// redirecting to login
		if (request.nextUrl.pathname.startsWith('/api')) {
			if (!token) {
				const response: ApiResponse = {
					success: false,
					message: 'Unauthorized',
				};
				return NextResponse.json(response, { status: 401 });
			}
		}
		// If no token exists, redirect to login
		if (!token) {
			return deleteCookiesAndRedirect(LOGIN);
		}
		try {
			// Decode and verify JWT cookie
			const payload = await verifyJwtToken(token.value);
			if (!payload) {
				return deleteCookiesAndRedirect(LOGIN);
			}
			// If you have an admin role and path, secure it here
			if (request.nextUrl.pathname.startsWith('/admin')) {
				if (payload.role !== 'admin') {
					return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/access-denied`);
				}
			}
		} catch (error) {
			console.error(error);
			return deleteCookiesAndRedirect(LOGIN);
		}
	}
	let redirectToApp = false;
	// Redirect login to app if already logged in
	if (request.nextUrl.pathname === '/login') {
		const token = request.cookies.get('token');
		if (token) {
			try {
				const payload = await verifyJwtToken(token.value);
				if (payload) {
					redirectToApp = true;
				} else {
					return deleteCookiesAndRedirect(LOGIN);
				}
			} catch (error) {
				return deleteCookiesAndRedirect(LOGIN);
			}
		}
	}
	if (redirectToApp) {
		// Redirect to app dashboard
		return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/app`);
	} else {
		// Return the original response unaltered
		return NextResponse.next();
	}
}
