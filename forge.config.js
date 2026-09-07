module.exports = {
	makers: [
		{
			name: "@electron-forge/maker-zip",
			platforms: ["win32", "linux", "darwin"]
		}
	],

	rebuildConfig: {
		ignoreModules: ["native-apis"]
	}
};
