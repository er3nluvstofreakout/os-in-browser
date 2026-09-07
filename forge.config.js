const path = require("node:path");

module.exports = {
	packagerConfig: {
		extraResource: [
			path.resolve(process.env.CLOUDFLARED_PATH)
		]
	},

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