export default {
  routes: [
    {
      method: 'POST',
      path: '/thumbnails/generate-all',
      handler: 'thumbnail.generateThumbnails',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/thumbnails/generate/:id',
      handler: 'thumbnail.generateThumbnailForFile',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/thumbnails/debug',
      handler: 'thumbnail.debugFiles',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/thumbnails/update-preview-urls',
      handler: 'thumbnail.updatePreviewUrls',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 