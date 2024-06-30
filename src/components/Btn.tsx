import { twMerge } from 'tailwind-merge';

export default function Btn({
    onClick,
    children,
    className,
    disabled,
    type = "primary",
    to,
    submitAction
}: {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    type?: "primary" | "danger" | "secondary";
    to?: string;
    submitAction?: string;
}) {

    const buttonProps = {
        className: twMerge(
            "rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",
            className,
            (type === "secondary") && "bg-white text-gray-800 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
            (type === "danger") && "bg-red-600 hover:bg-red-500",
        ),
        onClick,
        disabled,
        type: (submitAction ? "submit" : "button") as ("submit" | "button" | "reset"),
        name: "submitAction",
        value: submitAction,
    };

    return (
        <>
            {to ? (
                <a href={to}>
                    <button {...buttonProps}>
                        {children}
                    </button>
                </a>
            ) : (
                <button {...buttonProps}>
                    {children}
                </button>
            )}
        </>
    );
}
