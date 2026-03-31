import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Garante que os caminhos dos assets sejam relativos para o GitHub Pages
  build: {
    assetsInlineLimit: 0, // Evita que imagens pequenas sejam convertidas em base64, o que pode quebrar caminhos no Phaser
  }
});
