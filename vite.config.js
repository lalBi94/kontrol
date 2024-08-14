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
                secure: false,
            },
            "/users": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: false,
            },
            "/nwrite": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: false,
            },
            "/pandora": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: false,
            },
            "/webfav": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: false,
            },
            "/report": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: false,
            },
            "/photomaton": {
                target: process.env.VITE_API_IP,
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
