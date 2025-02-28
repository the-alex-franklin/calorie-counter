import React from "react";

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

type FormInputProps = InputProps & { label: string };

export const FormInput = ({ label, ...rest }: FormInputProps) => (
	<div className="mb-4">
		<label className="block text-sm font-medium text-gray-700 mb-1">
			{label}
		</label>
		<input
			{...rest}
			className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
		/>
	</div>
);
