import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { cloudinary } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const uploadPresets = {
  media: null,
  product: { width: 1200, height: 1380 },
  grid: { width: 1200, height: 1380 },
  categoryCard: { width: 1200, height: 1776 },
  desktopBanner: { width: 1592, height: 640 },
  mobileBanner: { width: 583, height: 1182 },
} as const;

type UploadPreset = keyof typeof uploadPresets;
type UploadPresetConfig = (typeof uploadPresets)[UploadPreset];

function uploadToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<{
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      },
    );

    stream.end(buffer);
  });
}

function getOptimizedDeliveryUrl(
  publicId: string,
  preset: UploadPresetConfig,
) {
  const transformation = preset
    ? [
        {
          width: preset.width,
          height: preset.height,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
      ]
    : [
        {
          quality: "auto",
          fetch_format: "auto",
        },
      ];

  return cloudinary.url(publicId, {
    secure: true,
    transformation,
  });
}

async function warmOptimizedDeliveryUrl(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Warm-up failed with ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    return {
      ok: true,
      bytes: buffer.byteLength,
      contentType: response.headers.get("content-type"),
      error: null as string | null,
    };
  } catch (error) {
    return {
      ok: false,
      bytes: null as number | null,
      contentType: null as string | null,
      error: error instanceof Error ? error.message : "Warm-up failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file");
    const subfolder = String(formData.get("folder") || "products")
      .replace(/[^a-z0-9/_-]/gi, "-")
      .replace(/\/+/g, "/")
      .replace(/^\/|\/$/g, "");
    const presetName = String(formData.get("preset") || "media") as UploadPreset;
    const preset = uploadPresets[presetName] ?? uploadPresets.media;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image must be smaller than 10 MB" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const rootFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "vriksha";
    const result = await uploadToCloudinary(
      Buffer.from(arrayBuffer),
      `${rootFolder}/${subfolder}`,
    );

    const optimizedUrl = getOptimizedDeliveryUrl(result.public_id, preset);
    const warmup = await warmOptimizedDeliveryUrl(optimizedUrl);

    return NextResponse.json({
      image: {
        ...result,
        original_secure_url: result.secure_url,
        secure_url: optimizedUrl,
        width: preset?.width ?? result.width,
        height: preset?.height ?? result.height,
        preset: presetName,
        source_size_bytes: file.size,
        optimized_delivery: true,
        optimized_delivery_warmed: warmup.ok,
        optimized_delivery_bytes: warmup.bytes,
        optimized_delivery_content_type: warmup.contentType,
        warmup_error: warmup.error,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
