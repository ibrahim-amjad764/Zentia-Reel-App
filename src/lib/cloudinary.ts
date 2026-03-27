//libs/cloudinary.ts
import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary SDK

// Purpose: Cloudinary SDK instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,  // Your Cloudinary Cloud Name
  api_key: process.env.CLOUDINARY_API_KEY!,      // Your Cloudinary API Key
  api_secret: process.env.CLOUDINARY_API_SECRET!, // Your Cloudinary API Secret
  secure: true,  // Enforce secure HTTPS connection
});

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("file") as Blob;

  // Convert Blob to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload buffer to Cloudinary
  const upload = await cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
    if (error) throw error;
    return result;
  });

  // But better: use promisified version
  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer); // send buffer to the upload stream
  });

  return new Response(JSON.stringify({ url: result.secure_url }));
}
export default cloudinary;  // Purpose: Reusable Cloudinary client