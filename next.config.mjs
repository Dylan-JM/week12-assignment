/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.freepik.com", pathname: "/**" },
      { protocol: "https", hostname: "www.talentprise.com", pathname: "/**" },
      { protocol: "https", hostname: "www.vonage.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn-dynmedia-1.microsoft.com", pathname: "/**" },
      { protocol: "https", hostname: "www.mckinsey.com", pathname: "/**" },
      { protocol: "https", hostname: "pix4free.org", pathname: "/**" },
    ],
  },
};

export default nextConfig;
