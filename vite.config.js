import legacy from '@vitejs/plugin-legacy'
import autoprefixer from 'autoprefixer'
import vue from '@vitejs/plugin-vue'

// vite.config.js
export default {
    plugins: [
        vue(),
        legacy({
            targets: ['Android 4'],
        }),
    ],
    css: {
    
    postcss: {
      plugins: [
          autoprefixer({
            overrideBrowserslist: [
                'Android 4',
            ]
        }),
      ],
    }
  },
}