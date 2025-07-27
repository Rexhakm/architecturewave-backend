import { Context } from 'koa';

const createCloudinaryThumbnailUrl = (originalUrl: string): string | null => {
  const parts = originalUrl.split('/upload/');
  if (parts.length !== 2) return null;

  const [prefix, suffix] = parts;
  return `${prefix}/upload/w_200,h_200,c_thumb,g_center/${suffix}`;
};

export default (plugin: any) => {
  // Delay patching until bootstrap
  plugin.bootstrap = async () => {
    const originalUpload = plugin.controllers.upload?.upload;

    if (!originalUpload) {
      console.warn('⚠️ Cloudinary patch: plugin.controllers.upload.upload is not available');
      return;
    }

    plugin.controllers.upload.upload = async (ctx: Context) => {
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
            };
          }
        }
      }

      return ctx.send(uploadedFiles);
    };
  };

  return plugin;
};
