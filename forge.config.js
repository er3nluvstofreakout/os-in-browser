const path = require("node:path");

const cloudflared = {
	linux: "cloudflared/linux",
	win32: "cloudflared/windows.exe",
	darwin: "cloudflared/macos"
}[process.env.TARGET_PLATFORM];

module.exports = {
	packagerConfig: {
		extraResource: [path.join(__dirname, cloudflared)]
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