import imageCompression from 'browser-image-compression';

export const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration missing");
    }

    try {
        // Compress image
        const options = {
            maxSizeMB: 0.025, // 25KB
            maxWidthOrHeight: 800,
            useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        console.log(`Original size: ${file.size / 1024}KB, Compressed size: ${compressedFile.size / 1024}KB`);

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Upload failed");
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};
