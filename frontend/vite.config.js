import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
// import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [
    react(), 
    svgr(),
    // commonjs(),
  ],
  // define: {
  //   global: 'window', 
  // },
  server: {
    port: 3000,
//     open: false,
  },
});