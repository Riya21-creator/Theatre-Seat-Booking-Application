import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/seats": "http://localhost:5000",
            "/book": "http://localhost:5000",
            "/reset": "http://localhost:5000",
            "/api": "http://localhost:5000",
        },
    },
});