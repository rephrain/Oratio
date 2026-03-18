import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	onwarn: (warning, handler) => {
		if (warning.code === 'a11y-label-has-associated-control') return;
		if (warning.code === 'a11y-click-events-have-key-events') return;
		if (warning.code === 'a11y-no-noninteractive-element-interactions') return;
		handler(warning);
	},
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: false
		})
	}
};

export default config;
