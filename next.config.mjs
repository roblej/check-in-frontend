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
            {
                protocol: 'https',
                hostname: 'sist-checkin.s3.ap-northeast-2.amazonaws.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async rewrites(){
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';
        console.log('[Next.js Rewrites] API URL:', apiUrl);
        
        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/api/:path*`
            }
        ];
    }
};

export default nextConfig;
