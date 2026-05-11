export default function Loading() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4" style={{ maxWidth: 1280, margin: '0 auto' }}>
            {/* Header skeleton */}
            <div className="text-center mb-12">
                <div className="h-4 w-40 mx-auto rounded-full mb-4 animate-pulse" style={{ background: 'rgba(200,150,46,0.1)' }} />
                <div className="h-8 w-72 mx-auto rounded-xl mb-3 animate-pulse" style={{ background: 'rgba(200,150,46,0.08)' }} />
                <div className="h-4 w-96 mx-auto rounded-full animate-pulse" style={{ background: 'rgba(200,150,46,0.06)' }} />
            </div>

            {/* Content skeleton grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl p-6" style={{
                        background: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(200,150,46,0.06)',
                    }}>
                        <div className="h-4 w-3/4 rounded-full mb-4 animate-pulse" style={{ background: 'rgba(200,150,46,0.1)', animationDelay: `${i * 100}ms` }} />
                        <div className="h-3 w-full rounded-full mb-2 animate-pulse" style={{ background: 'rgba(200,150,46,0.06)', animationDelay: `${i * 100 + 50}ms` }} />
                        <div className="h-3 w-5/6 rounded-full mb-4 animate-pulse" style={{ background: 'rgba(200,150,46,0.06)', animationDelay: `${i * 100 + 100}ms` }} />
                        <div className="h-8 w-28 rounded-lg animate-pulse" style={{ background: 'rgba(200,150,46,0.08)', animationDelay: `${i * 100 + 150}ms` }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
