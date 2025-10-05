import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const hostIP = env.VITE_HOST;
  const hostPort = parseInt(env.VITE_PORT);

  return {
    plugins: [react()],
    server: {
      host: hostIP,
      port: hostPort,
      strictPort: true,
    },
  };
});
