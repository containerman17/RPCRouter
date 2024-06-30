
export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t">
            <div className="mx-auto max-w-7xl overflow-hidden px-6 py-6 sm:py-6 lg:px-8">
                {/* <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
                    {navigation.main.map((item) => (
                        <div key={item.name} className="pb-6">
                            <a href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                                {item.name}
                            </a>
                        </div>
                    ))}
                </nav> */}
                {/* <div className="mt-6 flex justify-center space-x-10">
                    {navigation.social.map((item) => (
                        <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">{item.name}</span>
                            <item.icon className="h-6 w-6" aria-hidden="true" />
                        </a>
                    ))}
                </div> */}
                <p className=" text-center text-xs leading-5 text-gray-500">
                    &copy; 2023-{new Date().getFullYear()} Made by <a href="https://containerman.me/"
                        className="text-primary-600 underline"
                    >ContainerMan</a>
                </p>
            </div>
        </footer>
    )
}
