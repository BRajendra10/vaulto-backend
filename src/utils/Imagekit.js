import ImageKit from "imagekit";
import fs from "fs";
import path from "path";

// --------------------
// ImageKit Config
// --------------------
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// --------------------
// Upload Image
// --------------------
export const uploadImage = async (filePath) => {
  try {
    // Read uploaded file
    const file = fs.readFileSync(filePath);

    // Upload to ImageKit
    const res = await imagekit.upload({
      file: file,
      fileName: path.basename(filePath),
      folder: "/avatars",
    });

    // Remove local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: res.url,
      fileId: res.fileId,
    };
  } catch (error) {
    console.log(error)
    console.error("ImageKit upload failed:", error);

    // Cleanup local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new Error(error?.message || "Image upload failed");
  }
};

// --------------------
// Delete Image
// --------------------
export const deleteImage = async (fileId) => {
  try {
    if (!fileId) return null;

    return await imagekit.deleteFile(fileId);
  } catch (error) {
    // Don't crash app if deletion fails
    console.error("Delete image failed:", error.message);
    return null;
  }
};

// --------------------
// Default Avatar
// --------------------
export const getDefaultAvatar = () => {
  return {
    url: process.env.DEFAULT_AVATAR_URL,
    fileId: null,
  };
};