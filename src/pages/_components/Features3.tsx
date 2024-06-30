import {
    CogIcon,
    ServerIcon,
    WrenchScrewdriverIcon,
    GlobeAmericasIcon,
    ShieldCheckIcon,
    SignalIcon,
} from '@heroicons/react/24/outline'

const features = [
    {
        name: 'Seamless Failover',
        description: 'Automatically reroutes failed requests, maintaining uninterrupted service for your users.',
        icon: WrenchScrewdriverIcon,
    },
    {
        name: 'Predictive Routing',
        description: 'Utilizes real-time stats on latency and failure rates to dynamically select the optimal endpoint.',
        icon: ServerIcon,
    },
    {
        name: 'Front-Runners Mitigation',
        description: 'Intelligently broadcasts transactions to effectively shield against potential front-running attacks.',
        icon: SignalIcon,
    },
    {
        name: 'Enhanced De-Fi Security',
        description: 'Optionally performs multiple parallel RPC response verifications to ensure node integrity and prevent deception.',
        icon: ShieldCheckIcon,
    },
    {
        name: 'Self-Hosted',
        description: 'Deploy RPCRouter within your own infrastructure for critical services like bridges, enhancing control and security.',
        icon: CogIcon,
    },
    {
        name: 'Commercial support',
        description: 'Get commercial support for RPCRouter from the team behind RPCRouter.',
        icon: GlobeAmericasIcon,
    },
]

export default function Features3() {
    return (
        <div className="relative bg-white py-16 sm:py-16 lg:py-32" id="features">
            <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
                {/* <h2 className="text-lg font-semibold text-primary-600">Tired of switching endpoints manually?</h2> */}
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl max-w-7xl mx-auto">
                    Unify Your RPC Endpoints
                </p>
                <p className="mx-auto mt-5 max-w-prose text-xl text-gray-500">
                    RPCRouter is an open-source high-availability, low-latency, and failover-protected endpoint designed to optimize your RPC requests' latency and reliability.
                </p>
                <div className="mt-20">
                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.name} className="pt-6">
                                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8 border">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center rounded-xl bg-primary-600 p-3 shadow-lg">
                                                <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-semibold leading-8 tracking-tight text-gray-900">
                                            {feature.name}
                                        </h3>
                                        <p className="mt-5 text-base leading-7 text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
