const createCloudinaryThumbnailUrl = (originalUrl: string): string | null => {
  const parts = originalUrl.split('/upload/');
  if (parts.length !== 2) return null;

  const [prefix, suffix] = parts;
  return `${prefix}/upload/w_200,h_200,c_thumb,g_center/${suffix}`;
};

export default {
  createCloudinaryThumbnailUrl,

  async generateThumbnailForFile(fileId: string | number) {
    const file = await strapi.entityService.findOne('plugin::upload.file', fileId);
    
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

    await strapi.entityService.update('plugin::upload.file', fileId, {
      data: {
        formats: updatedFormats
      }
    });

    return thumbnailFormat;
  },

  async generateThumbnailsForAllFiles() {
    const files = await strapi.entityService.findMany('plugin::upload.file', {
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
  },

  async ensureThumbnailExists(fileId: string | number) {
    const file = await strapi.entityService.findOne('plugin::upload.file', fileId);
    
    if (!file) {
      return null;
    }

    // If thumbnail already exists, return it
    const formats = file.formats as any;
    if (formats?.thumbnail?.url) {
      return formats.thumbnail;
    }

    // Generate thumbnail if it doesn't exist
    return await this.generateThumbnailForFile(fileId);
  }
}; 