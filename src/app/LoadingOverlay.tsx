'use client';

import React from 'react';

import { useApp } from '@/contexts/AppContext';

export default function LoadingOverlay() {
	const { isLoading } = useApp();

	if (!isLoading) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center text-white">
			<div className="flex items-center gap-3">
				<div className="loading loading-lg"></div>
				<div className="animate-pulse text-2xl font-bold">Loading...</div>
			</div>
		</div>
	);
}
