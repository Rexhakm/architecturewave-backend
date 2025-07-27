import type { Core } from '@strapi/strapi';

const createCloudinaryThumbnailUrl = (originalUrl: string): string | null => {
  const parts = originalUrl.split('/upload/');
  if (parts.length !== 2) return null;

  const [prefix, suffix] = parts;
  return `${prefix}/upload/w_200,h_200,c_thumb,g_center/${suffix}`;
};

export default async function addThumbnailsToExistingFiles(strapi: Core.Strapi) {
  console.log('Starting thumbnail generation for existing files...');

  try {
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
            formats: updatedFormats
          }
        });

        console.log(`✅ Added thumbnail for file ${file.id}: ${file.name}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error adding thumbnail for file ${file.id}:`, error);
        errorCount++;
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`✅ Successfully added thumbnails: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
} 