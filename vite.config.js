import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/socket.io": {
                target: process.env.VITE_SOCKET_IP,
                changeOrigin: true,
                secure: true,
            },
            "/users": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: true,
            },
            "/nwrite": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: true,
            },
            "/pandora": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: true,
            },
            "/webfav": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: true,
            },
            "/report": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: true,
            },
            "/photomaton": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: true,
            },
        },
    },
});
