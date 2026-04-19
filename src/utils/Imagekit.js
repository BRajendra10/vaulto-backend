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
// Upload Image (from multer local file)
// --------------------
export const uploadImage = async (filePath) => {
  try {
    const file = fs.readFileSync(filePath);

    const res = await imagekit.upload({
      file,
      fileName: path.basename(filePath),
      folder: "/avatars",
    });

    fs.unlinkSync(filePath);

    return {
      url: res.url,
      fileId: res.fileId,
    };
  } catch (error) {
    throw new Error("Image upload failed");
  }
};

// --------------------
// Delete Image (by fileId)
// --------------------
export const deleteImage = async (fileId) => {
  try {
    if (!fileId) return;

    return await imagekit.deleteFile(fileId);
  } catch (error) {
    // do not crash app on delete failure
    console.error("Delete image failed:", error.message);
    return null
  }
};

// --------------------
// Get Default Avatar
// --------------------
export const getDefaultAvatar = () => {
  return {
    url: process.env.DEFAULT_AVATAR_URL,
    fileId: null,
  };
};