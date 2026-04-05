import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { describeImage, getEmbeddingsWithAI } from "@/lib/openai";
import { FileData } from "@/types";

const ALLOWED_TYPES = [
  "image/png", "image/jpeg", "image/webp", "image/gif",
  "text/plain", "application/json",
];

const s3 = new S3Client({
  region: process.env.GADGETOS_REGION!,
  credentials: {
    accessKeyId: process.env.GADGETOS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.GADGETOS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.GADGETOS_S3_BUCKET!;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileEntries = formData.getAll("file") as File[];
    const folderId = formData.get("folderId") as string | null;

    if (!folderId || fileEntries.length === 0) {
      return NextResponse.json({ error: "Missing folderId or files" }, { status: 400 });
    }

    const filesData: FileData[] = [];

    for (const file of fileEntries) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 });
      }

      const filename = file.name || `upload-${Date.now()}`;
      const key = `files/${folderId}/${Date.now()}-${filename}`;

      let content = "";
      let description: string;

      if (file.type.startsWith("image/")) {
        description = await describeImage(file);
      } else {
        content = await file.text();
        description = content;
      }

      const snippet = description.length > 1000 ? description.slice(0, 1000) + "…" : description;
      const vector = await getEmbeddingsWithAI(snippet);

      const buffer = Buffer.from(await file.arrayBuffer());
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      }));

      filesData.push({
        contentUrl: key,
        name: filename,
        type: file.type,
        content,
        size: file.size.toString(),
        description,
        vector,
      });
    }

    return NextResponse.json({ files: filesData });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}
