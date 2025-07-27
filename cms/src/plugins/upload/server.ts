const createCloudinaryThumbnailUrl = (originalUrl: string): string | null => {
  const parts = originalUrl.split('/upload/');
  if (parts.length !== 2) return null;

  const [prefix, suffix] = parts;
  return `${prefix}/upload/w_200,h_200,c_thumb,g_center/${suffix}`;
};

export default (plugin: any) => {
  plugin.bootstrap = async () => {
    const originalUpload = plugin.controllers.upload.upload;

    plugin.controllers.upload.upload = async (ctx: any) => {
      await originalUpload(ctx);

      const uploadedFiles = ctx.response.body as any[];

      for (const file of uploadedFiles) {
        if (!file.formats) file.formats = {};

        if (file.url && file.provider === 'cloudinary') {
          const thumbnailUrl = createCloudinaryThumbnailUrl(file.url);

          if (thumbnailUrl) {
            file.formats.thumbnail = {
              url: thumbnailUrl,
              width: 200,
              height: 200,
              ext: '.jpg',
              hash: 'thumb',
              mime: 'image/jpeg',
              name: 'thumbnail',
              size: 0.1,
              path: null,
              provider: 'cloudinary',
            };
          }
        }
      }

      ctx.body = uploadedFiles;
    };
  };

  return plugin;
};
