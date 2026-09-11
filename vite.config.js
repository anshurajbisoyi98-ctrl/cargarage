import { defineConfig } from 'vite';
export default defineConfig({server:{host:'127.0.0.1',port:5175,strictPort:true,proxy:{'/api':'http://127.0.0.1:5001'}},preview:{port:4175,proxy:{'/api':'http://127.0.0.1:5001'}}});
