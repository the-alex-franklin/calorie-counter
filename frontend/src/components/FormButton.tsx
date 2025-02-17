import React from "react";

interface FormButtonProps {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

const FormButton = (
  { text, onClick, type = "button", disabled = false }: FormButtonProps,
) => (
  <button
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

export default FormButton;
