import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const formData = await req.formData();
  const files = formData.getAll('images');

  try {
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;
        const upload = await cloudinary.uploader.upload(dataUri, {
          folder: 'rentapp-apartments',
        });
        return upload.secure_url;
      })
    );

    return NextResponse.json({ urls: uploadResults });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
  }
}
