import type { Context } from 'koa';

const createCloudinaryThumbnailUrl = (originalUrl: string): string | null => {
  const parts = originalUrl.split('/upload/');
  if (parts.length !== 2) return null;

  const [prefix, suffix] = parts;
  return `${prefix}/upload/w_200,h_200,c_thumb,g_center/${suffix}`;
};

export default {
  async generateThumbnails(ctx: Context) {
    try {
      console.log('Starting thumbnail generation for existing files...');

      // Get all files that are from Cloudinary and don't have thumbnail formats
      const files = await strapi.entityService.findMany('plugin::upload.file', {
        filters: {
          provider: 'cloudinary',
          $or: [
            { formats: { $null: true } },
            { formats: { $notContains: { thumbnail: { $exists: true } } } }
          ]
        }
      });

      console.log(`Found ${files.length} files without thumbnails`);

      let successCount = 0;
      let errorCount = 0;
      const results: any[] = [];

      for (const file of files) {
        try {
          if (!file.url) {
            console.log(`Skipping file ${file.id}: no URL`);
            continue;
          }

          const thumbnailUrl = createCloudinaryThumbnailUrl(file.url);
          
          if (!thumbnailUrl) {
            console.log(`Skipping file ${file.id}: could not generate thumbnail URL`);
            continue;
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

          await strapi.entityService.update('plugin::upload.file', file.id, {
            data: {
              formats: updatedFormats,
              previewUrl: thumbnailUrl
            }
          });

          console.log(`✅ Added thumbnail for file ${file.id}: ${file.name}`);
          successCount++;
          results.push({ fileId: file.id, success: true, name: file.name });

        } catch (error: any) {
          console.error(`❌ Error adding thumbnail for file ${file.id}:`, error);
          errorCount++;
          results.push({ fileId: file.id, success: false, error: error.message });
        }
      }

      console.log(`\nThumbnail generation completed:`);
      console.log(`✅ Successfully added thumbnails: ${successCount}`);
      console.log(`❌ Errors: ${errorCount}`);

      ctx.body = {
        success: true,
        message: `Generated thumbnails for ${successCount} files`,
        results: {
          total: files.length,
          success: successCount,
          errors: errorCount,
          details: results
        }
      };

    } catch (error: any) {
      console.error('Thumbnail generation failed:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  async generateThumbnailForFile(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        ctx.status = 400;
        ctx.body = { success: false, error: 'File ID is required' };
        return;
      }

      const file = await strapi.entityService.findOne('plugin::upload.file', id);
      
      if (!file) {
        ctx.status = 404;
        ctx.body = { success: false, error: 'File not found' };
        return;
      }

      if (file.provider !== 'cloudinary') {
        ctx.status = 400;
        ctx.body = { success: false, error: 'File is not from Cloudinary' };
        return;
      }

      if (!file.url) {
        ctx.status = 400;
        ctx.body = { success: false, error: 'File has no URL' };
        return;
      }

      const thumbnailUrl = createCloudinaryThumbnailUrl(file.url);
      
      if (!thumbnailUrl) {
        ctx.status = 400;
        ctx.body = { success: false, error: 'Could not generate thumbnail URL' };
        return;
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

      await strapi.entityService.update('plugin::upload.file', file.id, {
        data: {
          formats: updatedFormats
        }
      });

      ctx.body = {
        success: true,
        message: 'Thumbnail generated successfully',
        thumbnail: thumbnailFormat
      };

    } catch (error: any) {
      console.error('Error generating thumbnail:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  async debugFiles(ctx: Context) {
    try {
      const files = await strapi.entityService.findMany('plugin::upload.file', {
        sort: { createdAt: 'desc' },
        pagination: { page: 1, pageSize: 10 }
      });

      const debugData = files.map(file => {
        const formats = file.formats as any;
        return {
          id: file.id,
          name: file.name,
          url: file.url,
          provider: file.provider,
          hasThumbnail: !!formats?.thumbnail,
          thumbnailUrl: formats?.thumbnail?.url || null,
          formats: file.formats
        };
      });

      ctx.body = {
        success: true,
        files: debugData
      };

    } catch (error: any) {
      console.error('Error debugging files:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  async updatePreviewUrls(ctx: Context) {
    try {
      console.log('Starting preview URL update for existing files...');

      const files = await strapi.entityService.findMany('plugin::upload.file', {
        sort: { createdAt: 'desc' },
        pagination: { page: 1, pageSize: 50 }
      });

      console.log(`Found ${files.length} files total`);

      let successCount = 0;
      let errorCount = 0;
      const results: any[] = [];

      for (const file of files) {
        try {
          // Only process Cloudinary files
          if (file.provider !== '@strapi/provider-upload-cloudinary') {
            console.log(`Skipping non-Cloudinary file ${file.id}: ${file.name} (provider: ${file.provider})`);
            continue;
          }

          const formats = file.formats as any;
          const thumbnailUrl = formats?.thumbnail?.url;

          if (thumbnailUrl) {
            await strapi.entityService.update('plugin::upload.file', file.id, {
              data: {
                previewUrl: thumbnailUrl
              }
            });

            console.log(`✅ Updated preview URL for file ${file.id}: ${file.name}`);
            successCount++;
            results.push({ fileId: file.id, success: true, name: file.name, previewUrl: thumbnailUrl });
          } else {
            console.log(`⚠️ No thumbnail found for file ${file.id}: ${file.name}`);
            results.push({ fileId: file.id, success: false, error: 'No thumbnail found' });
          }

        } catch (error: any) {
          console.error(`❌ Error updating preview URL for file ${file.id}:`, error);
          errorCount++;
          results.push({ fileId: file.id, success: false, error: error.message });
        }
      }

      console.log(`\nPreview URL update completed:`);
      console.log(`✅ Successfully updated: ${successCount}`);
      console.log(`❌ Errors: ${errorCount}`);

      ctx.body = {
        success: true,
        message: `Updated preview URLs for ${successCount} files`,
        results: {
          total: files.length,
          success: successCount,
          errors: errorCount,
          details: results
        }
      };

    } catch (error: any) {
      console.error('Preview URL update failed:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }
}; 