import React from "react";

type FormInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
	label: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const FormInput = (
	{ label, onChange, onKeyDown, ...rest }: FormInputProps,
) => (
	<div className="mb-4">
		<label className="block text-sm font-medium text-gray-700 mb-1">
			{label}
		</label>
		<input
			{...rest}
			onChange={onChange}
			onKeyDown={onKeyDown}
			className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
		/>
	</div>
);
