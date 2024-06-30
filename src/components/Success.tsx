import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { twMerge } from 'tailwind-merge'

export default function Success({ title, subtitle, className }: { title: string, subtitle?: string, className?: string }) {
    return (
        <div className={twMerge("rounded-md bg-green-50 p-4 mb-4", className)}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">{title}</h3>
                    {subtitle && <div className="mt-2 text-sm text-green-700">
                        <p>{subtitle}</p>
                    </div>}
                </div>
            </div>
        </div>
    )
}
