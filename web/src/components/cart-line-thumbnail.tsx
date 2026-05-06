"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  cartImageUnoptimized,
  resolveCartLineImageSrc,
} from "@/lib/cart-line-image";

export function CartLineThumbnail({
  slug,
  title,
  imageSrc,
}: {
  slug: string;
  title: string;
  imageSrc?: string | null;
}) {
  const primary = resolveCartLineImageSrc(slug, imageSrc);
  const [src, setSrc] = useState(primary);

  useEffect(() => {
    setSrc(resolveCartLineImageSrc(slug, imageSrc));
  }, [slug, imageSrc]);

  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
      <Image
        src={src}
        alt=""
        fill
        className="object-contain p-1.5"
        sizes="56px"
        unoptimized={cartImageUnoptimized(src)}
        onError={() => {
          setSrc(
            `https://placehold.co/112x112/e2e8f0/0f766e?text=${encodeURIComponent(title.slice(0, 12))}`
          );
        }}
      />
    </div>
  );
}
