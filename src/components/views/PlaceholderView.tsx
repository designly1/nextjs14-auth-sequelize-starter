import React from 'react';

interface Props {
	title: string;
	text?: string;
}

export default function PlaceholderView(props: Props) {
	const { title, text = 'Coming soon!' } = props;

	return (
		<div className="flex flex-col items-center gap-6 w-full max-w-xl border-2 p-6 rounded-2xl m-auto">
			<h1 className="text-2xl text-primary">{title}</h1>
			<p>{text}</p>
		</div>
	);
}
