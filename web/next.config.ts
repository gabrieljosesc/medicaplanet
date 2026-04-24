import type { NextConfig } from "next";

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  { protocol: "https", hostname: "placehold.co", pathname: "/**" },
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  /* Partner store CDN (peptide listing imagery). */
  { protocol: "https", hostname: "purechainresearch.com", pathname: "/wp-content/uploads/**" },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    remotePatterns.push(
      { protocol: "https", hostname, pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname, pathname: "/storage/v1/render/image/**" }
    );
  } catch {
    /* invalid env URL */
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
