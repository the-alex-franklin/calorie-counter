import React from "react";

type FormButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
	text: string;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export const FormButton = (
	{ text, onClick, type = "button", disabled = false, ...rest }: FormButtonProps,
) => (
	<button
		{...rest}
		type={type}
		onClick={onClick}
		disabled={disabled}
		className={`w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
			disabled ? "opacity-50 cursor-not-allowed" : ""
		}`}
	>
		{text}
	</button>
);
