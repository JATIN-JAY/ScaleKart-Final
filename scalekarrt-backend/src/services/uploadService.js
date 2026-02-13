const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");

// Upload single image
const uploadImage = async (fileBuffer, folder = "scalekarrt/products") => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );

      stream.end(fileBuffer);
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
  console.error("CLOUDINARY REAL ERROR:", error); // ← ADD THIS
  throw new AppError('Image upload failed', 500);
}
//   catch (error) {
//     throw new AppError("Image upload failed", 500);
//   }
};

// Upload multiple
const uploadMultipleImages = async (files, folder) => {
  return Promise.all(files.map((f) => uploadImage(f.buffer, folder)));
};

// Delete image
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
};
