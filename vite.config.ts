import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [],
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "index.html"),
        login: path.resolve(import.meta.dirname, "login.html"),
        checkout: path.resolve(import.meta.dirname, "checkout.html"),
        cart: path.resolve(import.meta.dirname, "cart.html"),
        catalog: path.resolve(import.meta.dirname, "catalog.html"),
        cabinet: path.resolve(import.meta.dirname, "cabinet.html"),
        profile: path.resolve(import.meta.dirname, "profile.html"),
        history: path.resolve(import.meta.dirname, "history.html"),
        favorites: path.resolve(import.meta.dirname, "favorites.html"),
        delivery: path.resolve(import.meta.dirname, "delivery.html"),
        contacts: path.resolve(import.meta.dirname, "contacts.html"),
        faq: path.resolve(import.meta.dirname, "faq.html"),
        articles: path.resolve(import.meta.dirname, "articles.html"),
        article: path.resolve(import.meta.dirname, "article.html"),
        health: path.resolve(import.meta.dirname, "health.html"),
        beauty: path.resolve(import.meta.dirname, "beauty.html"),
        devices: path.resolve(import.meta.dirname, "devices.html"),
        channels: path.resolve(import.meta.dirname, "channels.html"),
        presentations: path.resolve(import.meta.dirname, "presentations.html"),
        privacy: path.resolve(import.meta.dirname, "privacy.html"),
        reviews: path.resolve(import.meta.dirname, "reviews.html"),
        map: path.resolve(import.meta.dirname, "map.html"),
        "all-products": path.resolve(import.meta.dirname, "all-products.html"),
        "new-items": path.resolve(import.meta.dirname, "new-items.html"),
        "product-detail": path.resolve(import.meta.dirname, "product-detail.html"),
        "payment-delivery": path.resolve(import.meta.dirname, "payment-delivery.html"),
        "change-password": path.resolve(import.meta.dirname, "change-password.html"),
      },
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false,
    },
  },
  preview: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
