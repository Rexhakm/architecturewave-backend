module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET', 'iE220HUgV6mfQFomynB1ZXGnBmu6H0SJe4t5JtW5lE4='),
    },
  },
  upload: {
    config: {
      provider: '@strapi/provider-upload-cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
    },
  },
  actionOptions: {
    upload: {
      folder: 'strapi-uploads', // Optional: your custom folder
      transformation: [
        {
          width: 200,
          height: 200,
          crop: 'thumb',
          gravity: 'center',
        },
      ],
    },
  },
}); 