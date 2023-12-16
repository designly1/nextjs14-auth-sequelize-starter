import React from 'react';
import ErrorView from '@/components/views/ErrorView';

export default function AccessDeniedPage() {
	return <ErrorView message="Access Denied - you do not have authorization to access this page." />;
}
