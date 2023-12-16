import React from 'react';

import { BiSolidError } from 'react-icons/bi';

interface Props {
	message: string;
	onClear?: () => void;
}

export default function ErrorView(props: Props) {
	const { message, onClear } = props;

	return (
		<div className="bg-error text-white flex flex-col gap-6 items-center w-full max-w-xl m-auto p-6 rounded-2xl">
			<h1 className="text-3xl flex items-center gap-3">
				<BiSolidError />
				Error
			</h1>
			<p>{message}</p>
			{onClear && (
				<button className="btn btn-ghost" onClick={onClear}>
					Clear
				</button>
			)}
		</div>
	);
}
