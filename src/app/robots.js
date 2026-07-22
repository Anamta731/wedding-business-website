export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/thank-you", "/lp/"],
    },
    sitemap: "https://vowsandvedas.com/sitemap.xml",
  };
}
