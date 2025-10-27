/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'tong.visitkorea.or.kr',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'tong.visitkorea.or.kr',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async rewrites(){
        return [
            {
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'}/api/:path*`
        }
        ]
    }
};

export default nextConfig;
