const { withContentlayer } = require('next-contentlayer2')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// CSP 策略定义
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src *.s3.amazonaws.com;
  connect-src *;
  font-src 'self';
  frame-src giscus.app
`

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy.replace(/\n/g, '') },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

// 环境变量判断
const isExport = process.env.EXPORT === '1'
const basePath = process.env.BASE_PATH || ''
const unoptimized = process.env.UNOPTIMIZED === '1'

/**
 * @type {import('next').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    // 关键修复 1: 显式设置导出模式
    output: isExport ? 'export' : undefined,
    basePath: basePath,

    // 关键修复 2: 静态导出必须开启 trailingSlash，否则 GitHub Pages 刷新会 404
    trailingSlash: true,

    reactStrictMode: true,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

    images: {
      remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
      unoptimized: isExport ? true : unoptimized, // 导出模式强制不优化图片
    },

    // 关键修复 3: 只有在非导出模式（如 Vercel/本地预览）下才加载 headers
    // 静态导出不支持 async headers()，强行加载会导致构建产物异常
    async headers() {
      if (isExport) return []
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ]
    },

    webpack: (config) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })
      return config
    },
  })
}
