module.exports = {
	type: 'react-component',
	npm: {
		esModules: true,
		umd: {
			global: 'markdown',
			externals: {
				react: 'React'
			}
		}
	},
	devServer: {
		disableHostCheck: true
	}
}
