module.exports = {
	makers: [
		{
			name: "@electron-forge/maker-zip"
		}
	],
	rebuildConfig: {
		ignoreModules: ["native-apis"]
	}
};