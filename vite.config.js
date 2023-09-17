import legacy from '@vitejs/plugin-legacy'
import autoprefixer from 'autoprefixer'

// vite.config.js
export default {
    plugins: [
        
        // autoprefixer({
        //     overrideBrowserslist: [
        //         'Android 4',
        //     ]
        // }),
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