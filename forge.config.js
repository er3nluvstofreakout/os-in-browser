const cloudflared = process.platform === "win32"
	? "cloudflared.exe"
	: "cloudflared";

module.exports = {
	packagerConfig: {
		extraResource: [cloudflared]
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