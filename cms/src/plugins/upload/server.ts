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

            // Set the previewURL for admin panel display
            file.previewURL = thumbnailUrl;

            // Save the thumbnail format to the database
            try {
              await plugin.strapi.entityService.update('plugin::upload.file', file.id, {
                data: {
                  formats: file.formats,
                  previewUrl: thumbnailUrl
                }
              });
            } catch (error) {
              console.error('Error saving thumbnail format:', error);
            }
          }
        }
      }

      ctx.body = uploadedFiles;
    };

    // Add a service to generate thumbnails for existing files
    plugin.services.thumbnailService = {
      async generateThumbnailForFile(fileId: string | number) {
        const file = await plugin.strapi.entityService.findOne('plugin::upload.file', fileId);
        
        if (!file || !file.url || file.provider !== 'cloudinary') {
          return null;
        }

        const thumbnailUrl = createCloudinaryThumbnailUrl(file.url);
        
        if (!thumbnailUrl) {
          return null;
        }

        const thumbnailFormat = {
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

        const existingFormats = file.formats || {};
        const updatedFormats = Object.assign({}, existingFormats, { thumbnail: thumbnailFormat });

        await plugin.strapi.entityService.update('plugin::upload.file', fileId, {
          data: {
            formats: updatedFormats,
            previewUrl: thumbnailUrl
          }
        });

        return thumbnailFormat;
      },

      async generateThumbnailsForAllFiles() {
        const files = await plugin.strapi.entityService.findMany('plugin::upload.file', {
          filters: {
            provider: 'cloudinary',
            $or: [
              { formats: { $null: true } },
              { formats: { $notContains: { thumbnail: { $exists: true } } } }
            ]
          }
        });

        const results: Array<{
          fileId: string | number;
          success: boolean;
          thumbnail?: any;
          error?: string;
        }> = [];
        
        for (const file of files) {
          try {
            const thumbnail = await this.generateThumbnailForFile(file.id);
            if (thumbnail) {
              results.push({ fileId: file.id, success: true, thumbnail });
            } else {
              results.push({ fileId: file.id, success: false, error: 'Could not generate thumbnail' });
            }
          } catch (error: any) {
            results.push({ fileId: file.id, success: false, error: error.message });
          }
        }

        return results;
      }
    };
  };

  return plugin;
};
