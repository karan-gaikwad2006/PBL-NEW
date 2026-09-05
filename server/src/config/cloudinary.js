const cloudinary = require('cloudinary').v2;
const { getEnv } = require('./env');

const cloudName = getEnv('CLOUDINARY_CLOUD_NAME');
const apiKey = getEnv('CLOUDINARY_API_KEY');
const apiSecret = getEnv('CLOUDINARY_API_SECRET');
const cloudinaryUrl = getEnv('CLOUDINARY_URL');

if (cloudinaryUrl) {
  cloudinary.config({
    cloudinary_url: cloudinaryUrl,
  });
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

function isCloudinaryConfigured() {
  const config = cloudinary.config();
  return Boolean(config.cloud_name && config.api_key && config.api_secret);
}

/**
 * Upload buffer to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer
 * @param {Object} options
 * @returns {Promise<Object>}
 */
function uploadBuffer(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary is not configured on the server.'));
    }

    const uploadOptions = {
      folder: 'poshansetu/institution_documents',
      resource_type: 'auto',
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    stream.end(fileBuffer);
  });
}

/**
 * Delete a file from Cloudinary by public ID
 * @param {string} publicId
 * @param {string} resourceType
 * @returns {Promise<Object>}
 */
function deleteFile(publicId, resourceType = 'image') {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return resolve({ result: 'not_configured' });
    }

    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadBuffer,
  deleteFile,
};
