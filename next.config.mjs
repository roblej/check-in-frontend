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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';
        console.log('Rewrite API URL:', apiUrl);
        
        if (!apiUrl || (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://'))) {
            console.error('Invalid API URL, using default');
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:8888/api/:path*'
                }
            ];
        }
        
        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/api/:path*`
            }
        ];
    }
};

export default nextConfig;
