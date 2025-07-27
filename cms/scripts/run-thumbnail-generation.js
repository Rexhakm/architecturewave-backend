const { execSync } = require('child_process');

console.log('🚀 Starting thumbnail generation for existing files...');

try {
  // Run the thumbnail generation via the API endpoint
  const result = execSync('curl -X POST http://localhost:1337/api/thumbnails/generate-all', {
    encoding: 'utf8'
  });
  
  console.log('✅ Thumbnail generation completed!');
  console.log('Result:', result);
  
} catch (error) {
  console.error('❌ Error running thumbnail generation:', error.message);
  
  console.log('\n📝 Alternative: You can also run this manually by:');
  console.log('1. Start your Strapi server: npm run develop');
  console.log('2. Visit: http://localhost:1337/api/thumbnails/generate-all');
  console.log('3. Or use curl: curl -X POST http://localhost:1337/api/thumbnails/generate-all');
} 