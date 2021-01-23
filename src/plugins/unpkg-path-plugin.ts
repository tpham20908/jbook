import * as esbuild from 'esbuild-wasm';
import axios from 'axios';

export const unpkgPathPlugin = () => {
	return {
		name: 'unpkg-path-plugin',
		setup(build: esbuild.PluginBuild) {
			build.onResolve({ filter: /.*/ }, async (args: any) => {
				console.log('onResolve', args);
				const { path } = args;
				if (path === 'index.js') {
					return { path: args.path, namespace: 'a' };
				} else if (path === 'tiny-test-pkg') {
					return {
						path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js',
						namespace: 'b',
					};
				}
			});

			build.onLoad({ filter: /.*/ }, async (args: any) => {
				console.log('onLoad', args);
				const { path } = args;

				if (path === 'index.js') {
					return {
						loader: 'jsx',
						contents: `
              const message = require('tiny-test-pkg');
              console.log(message);
            `,
					};
				}

				const { data } = await axios.get(path);
				return {
					loader: 'jsx',
					contents: data,
				};
			});
		},
	};
};
