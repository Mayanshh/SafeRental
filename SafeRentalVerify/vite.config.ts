import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  const plugins = [react()];
  
  // Only load Replit plugins in development environment
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    try {
      // Dynamically import Replit plugins only in development
      const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal");
      const cartographer = await import("@replit/vite-plugin-cartographer");
      const devBanner = await import("@replit/vite-plugin-dev-banner");
      
      // Add plugins if available
      if (runtimeErrorOverlay.default) plugins.push(runtimeErrorOverlay.default());
      if (cartographer.cartographer) plugins.push(cartographer.cartographer());
      if (devBanner.devBanner) plugins.push(devBanner.devBanner());
    } catch (error) {
      // Replit plugins not available in production, continue without them
      console.log("Development plugins not available, continuing...");
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      host: "0.0.0.0",
      port: 5000,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});