exports.id = 'agconnect_plugins';
exports.cliVersion = '>=3.2';
exports.init = init;

const path = require('path');
const fs = require('fs');

/**
 * Main entry point for our plugin which looks for the platform specific
 * plugin to invoke.
 *
 * @param {Object} logger The logger instance.
 * @param {Object} config The hook config.
 * @param {Object} cli The Titanium CLI instance.
 * @param {Object} appc The Appcelerator CLI instance.
 */
// eslint-disable-next-line no-unused-vars
function init(logger, config, cli, appc) {
	cli.on('build.pre.build', {
		post: function () {
			// 1. Copy the agconnect-services.json file
			const servicesFileSrc = path.resolve('./platform/android/agconnect-services.json');
			const servicesFileDest = path.resolve('./build/android/app/agconnect-services.json');
			if (!fs.existsSync(servicesFileSrc)) { return; }
			fs.copyFileSync(servicesFileSrc, servicesFileDest);

			// 2. Extend project-wide build.gradle
			const projectBuildGradle = path.resolve('./build/android/build.gradle');
			if (!fs.existsSync(projectBuildGradle)) { return; }

			const projectBuildGradleContents = fs.readFileSync(projectBuildGradle, 'utf-8').toString();
			const updatedProjectBuildGradleContents = projectBuildGradleContents
				.split('repositories {').join('repositories {\n\t\tmaven { url \'https://developer.huawei.com/repo/\' }')
				//.split('dependencies {').join('dependencies {\n\t\tclasspath \'com.android.tools.build:gradle:7.4.2\'') // Not necessary
				.split('dependencies {').join('dependencies {\n\t\tclasspath \'com.huawei.agconnect:agcp:1.9.1.302\'');

			fs.writeFileSync(projectBuildGradle, updatedProjectBuildGradleContents);
			
			// 2. Extend app-wide build.gradle
			const appBuildGradle = path.resolve('./build/android/app/build.gradle');
			if (!fs.existsSync(appBuildGradle)) { return; }

			const appBuildGradleContents = fs.readFileSync(appBuildGradle, 'utf-8').toString();
			const updatedAppBuildGradleContents = appBuildGradleContents
				.split('dependencies {').join(`
					dependencies {
						implementation 'com.huawei.hms:hianalytics:6.12.0.301'
						${''/* Add the following 2 dependencies if you use Huawei-Admob Mediation: https://github.com/Explore-In-HMS/huawei.ads.admob_mediation */}
						implementation 'com.huawei.hms:ads-lite:13.4.69.302' ${''/* Huawei Ads Lite (update to latest version)*/}
						implementation 'com.github.Explore-In-HMS:huawei.ads.admob_mediation:2.0.2' ${''/* Huawei Admob Mediation (update to latest version)*/}						
				`)
				.split('apply plugin: \'com.android.application\'').join('apply plugin: \'com.android.application\'\napply plugin: \'com.huawei.agconnect\'');

			fs.writeFileSync(appBuildGradle, updatedAppBuildGradleContents);
		}
	});
}
