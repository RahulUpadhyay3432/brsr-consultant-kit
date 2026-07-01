/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Owners attach supporting bills/invoices on the submit form (multipart
    // server action). Default cap is 1 MB; allow a few-MB PDF / photo.
    serverActions: { bodySizeLimit: "12mb" },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "brsr-consultant-kit.vercel.app" }],
        destination: "https://saaksh.co/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
