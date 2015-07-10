module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-node-webkit-builder');

	grunt.initConfig({
		nodewebkit: {
			options: {
				platforms: ['win32', 'win64'],
				winIco: 'icon.png'
			},
			src: ['./**/*']
		}
	});
}