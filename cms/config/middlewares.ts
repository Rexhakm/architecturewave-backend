export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://res.cloudinary.com',
            'https://*.cloudinary.com'
          ],
          'media-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
          'frame-src': ["'self'"],
          'object-src': ["'none'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", "'unsafe-inline'"],
        },
        upgradeInsecureRequests: null,
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
