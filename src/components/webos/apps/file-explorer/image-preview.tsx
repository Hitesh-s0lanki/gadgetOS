"use client";

import { File } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImagePreviewProps {
  s3Key: string;
  alt?: string;
  height?: number;
  width?: number;
}

export default function ImagePreview({ s3Key, alt = "preview", height = 30, width = 30 }: ImagePreviewProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!s3Key) return;
    fetch(`/api/presign?key=${encodeURIComponent(s3Key)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.url) setUrl(data.url);
        else setError(data.error ?? "Failed to get URL");
      })
      .catch((err) => setError(String(err)));
  }, [s3Key]);

  if (error) return <File className="w-8 h-8 text-gray-400" />;
  if (!url) return <File className="w-8 h-8 text-gray-300 animate-pulse" />;

  return (
    <Image src={url} alt={alt} height={height} width={width} className="rounded shadow-sm" />
  );
}
