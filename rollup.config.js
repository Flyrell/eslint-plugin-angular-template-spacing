import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.min.js',
        format: 'cjs',
        name: 'version',
        exports: 'default',
        plugins: [terser()],
    },
    plugins: [
        json(),
        typescript(),
    ],
    external: ['@angular/compiler']
};
