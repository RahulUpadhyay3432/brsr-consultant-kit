/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Owners attach supporting bills/invoices on the submit form (multipart
    // server action). Default cap is 1 MB; allow a few-MB PDF / photo.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
