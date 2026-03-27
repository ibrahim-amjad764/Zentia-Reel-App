// app/api/upload/route.ts
import { NextResponse } from "next/server";
import cloudinary from "../../../src/lib/cloudinary"; // your server-side Cloudinary SDK

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("file"); // all file from client

  if (!files || files.length === 0) {
    console.log("No images uploaded");
    return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
  }

  if (files.length > 6) {
    console.log("Too many images uploaded");
    return NextResponse.json({ error: "Max 6 images allowed" }, { status: 400 });
  }

  try {

    // Convert each File/Blob to a buffer and upload via stream
    const uploadPromises = files.map(async (file: any) => {
      //buffer handle binary data
      const buffer = Buffer.from(await (file as Blob).arrayBuffer());

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "posts", resource_type: "image" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error); // server-side error log
              return reject(error);
            }
            if (result) {
              console.log("Image uploaded successfully:", result.secure_url); // server-side success log
              resolve(result);
            } else {
              reject(new Error("Upload result is undefined"));
            }
          }
        );
        stream.end(buffer); // send buffer to Cloudinary
      });
      return result.secure_url; // return the uploaded image URL
    });

    const urls = await Promise.all(uploadPromises);
    console.log("All uploaded URLs:", urls);

    return NextResponse.json({ urls }); // send back array of image URLs
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Image upload failed", message }, { status: 500 });
  }
}