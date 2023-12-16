'use client';

import React, { useState } from 'react';
import ErrorView from '@/components/views/ErrorView';

import { seedUsers, syncDb } from '@/lib/utils/db/syncDb';
import { useApp } from '@/contexts/AppContext';

const EXECUTE = false;

export default function SeedDbPage() {
	const { isLoading, setIsLoading } = useApp();
	const [error, setError] = useState<string | null>(null);
	const [users, setUsers] = useState<any[]>([]);

	const handleSyncDb = async () => {
		if (isLoading) return;
		if (!EXECUTE) return;

		setIsLoading(true);
		try {
			await syncDb();
		} catch (e: any) {
            console.log(e);
			setError(e.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSeedUsers = async () => {
		if (isLoading) return;
		if (!EXECUTE) return;

		setIsLoading(true);
		try {
			const users = await seedUsers();
			setUsers(users);
		} catch (e: any) {
            console.log(e);
			setError(e.message);
		} finally {
			setIsLoading(false);
		}
	};

	if (error) {
		return <ErrorView message={error} onClear={() => setError(null)} />;
	}

	return (
		<div className="flex flex-col items-center gap-6 m-auto w-full max-w-xl">
			<h1 className="text-2xl">DB Tools</h1>
			{EXECUTE ? (
				<>
					<button className="btn btn-primary w-full" onClick={handleSyncDb}>
						Sync DB
					</button>
					<button className="btn btn-secondary w-full" onClick={handleSeedUsers}>
						Seed Users
					</button>
				</>
			) : (
				<>
					<p>Please set EXECUTE to true to use this tool.</p>
				</>
			)}
		</div>
	);
}
