export default function Card({
    children,
    to,
    title,
    className,
    subtitle,
}: {
    children?: React.ReactNode;
    to?: string;
    title?: string;
    className?: string;
    subtitle?: string;
}) {
    let titleHtml = title ? (
        <h2 className="text-lg font-semibold pb-4">{title}</h2>
    ) : null;

    if (subtitle) {
        titleHtml = (
            <>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-gray-500 text-xs pb-4">{subtitle}</p>
            </>
        );
    }

    if (!to) {
        return (
            <div className={`bg-white sm:rounded-md sm:shadow  p-4 text-gray-900 ${className || ""}`}>
                {titleHtml}
                {children}
            </div>
        );
    }
    return (
        <a href={to}>
            <div
                className={`bg-white sm:rounded-md sm:shadow  p-4 cursor-pointer hover:underline hover:shadow-lg ${className || ""
                    }`}
            >
                {titleHtml}
                {children}
            </div>
        </a>
    );
}
