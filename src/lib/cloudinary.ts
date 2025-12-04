const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(file: File): Promise<CloudinaryUploadResult> {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Cloudinary configuration is missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return {
        secure_url: data.secure_url,
        public_id: data.public_id,
    };
}

/**
 * Get optimized image URL from Cloudinary
 */
export function getOptimizedImageUrl(
    publicId: string,
    options: { width?: number; height?: number; quality?: number } = {}
): string {
    if (!CLOUDINARY_CLOUD_NAME) return "";

    const { width = 400, height, quality = "auto" } = options;
    const transforms = [`w_${width}`, `q_${quality}`, "f_auto"];

    if (height) transforms.push(`h_${height}`);

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}
