import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_SECRET_KEY!,
  urlEndpoint: "https://ik.imagekit.io/kabir4874/",
});

export type UploadSource = string | Buffer;

export interface UploadOptions {
  /** Folder path in ImageKit, e.g. '/products'. Defaults to '/products'. */
  folder?: string;
  /** Provide your own file name (without path). Defaults to generated. */
  fileName?: string;
  /** Extra options forwarded to imagekit.upload (e.g. tags, useUniqueFileName). */
  extra?: Record<string, any>;
}

export interface UploadResult {
  file_url: string;
  fileId: string;
}

/** Example: product-4729-1712789912345.jpg */
export function generateImageFileName(prefix = "product", ext = "jpg") {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}-${Date.now()}.${ext}`;
}

/** Upload an image (base64/dataURL string or Buffer) to ImageKit. */
export async function uploadImageToImageKit(
  file: UploadSource,
  opts: UploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = "/products",
    fileName = generateImageFileName("product", "jpg"),
    extra = {},
  } = opts;

  const res = await imagekit.upload({
    ...extra, // optional extras (won't override folder/fileName below)
    file, // base64 string OR Buffer
    fileName,
    folder,
  });

  return {
    file_url: res.url,
    fileId: res.fileId,
  };
}

/** Delete an image in ImageKit by fileId (uses the same module-scoped instance). */
export async function deleteImageFromImageKit(
  fileId: string
): Promise<{ success: true }> {
  await imagekit.deleteFile(fileId);
  return { success: true };
}
