import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import jsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    jsx(),
    dts({
      tsconfigPath: 'tsconfig.build.json',
      include: [
        'packages/cool-design/index.ts',
        'src/utils/create.ts',
        'src/utils/with-install.ts',
        'src/utils/overlay-stack.ts',
        'src/utils/use-floating.ts',
        'packages/cool-design/{button,button-group,avatar,badge,radio,radio-group,checkbox-group,row,col,config-provider,input,select,select-option,checkbox,switch,form,form-item,table,pagination,dialog,message,icon,space,divider,empty,loading,tag,tooltip,popconfirm,message-box,container,header,aside,main,footer,link,date-picker,time-picker,date-time-picker,calendar,autocomplete,color-picker,slider,transfer,tree-select,upload,card,descriptions,image,result,skeleton,tree,timeline,statistic,menu,breadcrumb,tabs,dropdown,steps,page-header,alert,drawer,notification,popover,watermark}/**/*.{ts,tsx}'
      ],
      exclude: ['**/__test__/**'],
      outDir: 'es'
    })
  ],
  build: {
    lib: { entry: 'packages/cool-design/index.ts' },
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          format: 'es',
          dir: 'es',
          preserveModules: true,
          entryFileNames: '[name].js',
          assetFileNames: '[name][extname]'
        },
        {
          format: 'cjs',
          dir: 'lib',
          preserveModules: true,
          entryFileNames: '[name].cjs',
          exports: 'named',
          assetFileNames: '[name][extname]'
        }
      ]
    }
  }
});
