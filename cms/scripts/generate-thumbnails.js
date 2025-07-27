const addThumbnailsToExistingFiles = require('../src/migrations/add-thumbnails-to-existing-files.ts').default;

async function runMigration() {
  try {
    // This script should be run from the Strapi console
    console.log('Starting thumbnail generation...');
    
    // Get the strapi instance
    const strapi = require('@strapi/strapi');
    const app = await strapi().load();
    
    await addThumbnailsToExistingFiles(app);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 