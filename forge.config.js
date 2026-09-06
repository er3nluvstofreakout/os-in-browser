module.exports = {
    packagerConfig: {
        asar: true
    },

    rebuildConfig: {},

    makers: [
        {
            name: "@electron-forge/maker-zip",
            platforms: [
                "win32",
                "linux",
                "darwin"
            ]
        }
    ]
}