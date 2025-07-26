'use strict';

const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

module.exports = (plugin) => {
  const originalUpload = plugin.services.upload.upload;

  plugin.services.upload.upload = async function (files, ctx) {
    for (const file of files) {
      try {
        const filePath = file.filepath || file.tmpPath;
        const ext = path.extname(file.name || file.originalName).toLowerCase();

        // Only compress JPEG/PNG
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          const optimizedBuffer = await sharp(filePath)
            .resize({ width: 1600 }) // Resize max width
            .toFormat('jpeg', { quality: 75 }) // Compress to 75% quality
            .toBuffer();

          await fs.writeFile(filePath, optimizedBuffer);
          file.size = optimizedBuffer.length / 1024 / 1024; // Update size in MB
        }
      } catch (err) {
        console.error('⚠️ Sharp optimization failed:', err.message);
      }
    }

    return await originalUpload.call(this, files, ctx);
  };

  return plugin;
}; 