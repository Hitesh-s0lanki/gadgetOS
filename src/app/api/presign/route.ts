import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.GADGETOS_REGION!,
  credentials: {
    accessKeyId: process.env.GADGETOS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.GADGETOS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.GADGETOS_S3_BUCKET!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }
  try {
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn: 3600 }
    );
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 });
  }
}
