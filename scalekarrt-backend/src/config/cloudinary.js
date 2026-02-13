const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("☁️ Cloudinary config loaded");

module.exports = cloudinary;
// console.log("Cloud:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("Key exists:", !!process.env.CLOUDINARY_API_KEY);
// console.log("Secret exists:", !!process.env.CLOUDINARY_API_SECRET);
