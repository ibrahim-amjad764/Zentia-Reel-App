/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  
  // SECURITY: Add comprehensive security headers for XSS protection
  async headers() {
    console.log("[XSS Protection] Applying security headers for XSS protection");
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'", // Only allow resources from same origin
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts and eval for Next.js Dev/Fast Refresh
              "style-src 'self' 'unsafe-inline'", // Allow inline styles for Tailwind
              "img-src 'self' data: https:", // Allow images from same origin, data URLs, and HTTPS
              "connect-src 'self' ws: wss: https://api.geoapify.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://*.firebaseio.com", // Allow API calls + WebSocket for HMR
              "font-src 'self'", // Allow fonts from same origin
              "object-src 'none'", // Disallow plugins (Flash, etc.)
              "base-uri 'self'", // Restrict base tag
              "form-action 'self'" // Restrict form submissions
            ].join('; ')
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block' // Enable XSS filter in browsers
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Prevent MIME type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin' // Control referrer information
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Prevent clickjacking
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()' // Restrict sensitive APIs
          }
        ]
      }
    ];
  },
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-left',
  },
  webpack: (config) => {
    config.plugins.push(
      new (require('webpack')).IgnorePlugin({
        resourceRegExp: /^(pg-native|mysql|mysql2|sqlite3|better-sqlite3|ioredis|typeorm-aurora-data-api-driver|pg-query-stream|oracledb|react-native-sqlite-storage|@sap\/hana-client|hdb-pool|mssql|mongodb|redis|sql.js|sqlite3|typeorm-model-generator)$/,
      })
    );
    
    // Suppress "Critical dependency: the request of a dependency is an expression" warnings
    config.module = {
      ...config.module,
      exprContextCritical: false,
      unknownContextCritical: false,
    };

    return config;
  },
};
 
module.exports = nextConfig;
