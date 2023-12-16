'use client';
import React, { useRef, useState } from 'react';

import { useSearchParams } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'nextjs13-progress';

import Turnstile from 'react-hook-turnstile';

import { I_ApiUserLoginRequest, I_ApiUserLoginResponse } from '../auth/login/route';

export default function LoginPage() {
	const isDev = process.env.NODE_ENV === 'development';
	let containerHeight = '510px';
	if (isDev) {
		containerHeight = '420px';
	}

	const { userData, loadUserData, isLoading, setIsLoading } = useApp();
	const router = useRouter();

	// Utils
	const searchParams = useSearchParams();
	const redirect = searchParams.get('redirect');

	// Refs
	const loginRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	// State
	const [error, setError] = useState('');
	const [loginIsComplete, setLoginIsComplete] = useState(false);
	const [tsToken, setTsToken] = useState('');

	// Handlers
	const handleLogin = async () => {
		if (isLoading) return;

		setIsLoading(true);
		setError('');
		try {
			if (!loginRef.current?.value || !passwordRef.current?.value)
				throw new Error('Please enter your credentials.');

			const payload: I_ApiUserLoginRequest = {
				login: loginRef.current?.value,
				password: passwordRef.current?.value,
				tsToken: tsToken,
			};

			const response = await fetch('/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			const data: I_ApiUserLoginResponse = await response.json();

			if (data.success) {
				setLoginIsComplete(true);
				loadUserData();
				if (redirect) {
					router.push(redirect);
				} else {
					router.push('/app');
				}
				return;
			}

			throw new Error(data.message);
		} catch (error) {
			let mess = 'Something went wrong.';
			if (error instanceof Error) {
				mess = error.message;
			}
			setError(mess);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className="m-auto flex flex-col items-center gap-6 p-10 w-full max-w-md border-2 rounded-xl"
			style={{ height: containerHeight }}
		>
			{loginIsComplete ? (
				<div className="m-auto flex flex-col gap-6 items-center">
					<div className="loading loading-spinner loading-lg"></div>
					<h1 className="text-2xl">Getting things ready...</h1>
				</div>
			) : (
				<>
					<h1 className="text-2xl">Welcome Back!</h1>
					<div className="form-control w-full">
						<label className="label">
							<span className="label-text">Login</span>
						</label>
						<input
							defaultValue="john@example.com"
							type="text"
							ref={loginRef}
							className="input input-bordered"
							onKeyDown={e => {
								if (e.key === 'Enter') {
									if (passwordRef.current) {
										passwordRef.current.focus();
									}
								}
							}}
						/>
					</div>
					<div className="form-control w-full">
						<label className="label">
							<span className="label-text">Password</span>
						</label>
						<input
							defaultValue="12345"
							type="password"
							ref={passwordRef}
							className="input input-bordered"
							onKeyDown={e => {
								if (e.key === 'Enter') {
									handleLogin();
								}
							}}
						/>
						<label className="label">
							<span className="label-text-alt text-error">{error}</span>
						</label>
					</div>
					<button className="btn btn-primary w-full" onClick={handleLogin}>
						Login
					</button>
					{!isDev && !isLoading ? (
						<Turnstile
							sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
							onVerify={token => setTsToken(token)}
						/>
					) : null}
				</>
			)}
		</div>
	);
}
