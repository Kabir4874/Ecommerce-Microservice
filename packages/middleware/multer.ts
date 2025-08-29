import multer from "multer";

// Set up memory storage
const storage = multer.memoryStorage();

// Multer configuration for multiple fields (images and shop logos)
export const multipleUpload = multer({
  storage, // Use the defined storage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
}).fields([
  { name: "images", maxCount: 8 }, // Handle multiple images
  { name: "shopLogos", maxCount: 10 }, // Handle multiple shop logos
]);

// Multer configuration for a single image upload
export const singleUpload = multer({ storage }).single("image");
