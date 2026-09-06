const {
    app,
    BrowserWindow,
    desktopCapturer
} = require("electron");

const path = require("node:path");

app.whenReady().then(() => {
    const window = new BrowserWindow({
        width: 1280,
        height: 720,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    const { session } = window.webContents;

    /*
     * Clipboard permissions
     *
     * Only this BrowserWindow's session gets these permissions.
     */
    session.setPermissionCheckHandler(
        (webContents, permission) => {
            if (
                permission === "clipboard-read" ||
                permission === "clipboard-sanitized-write"
            ) {
                return webContents === window.webContents
            }

            if (permission === "display-capture") {
                return webContents === window.webContents
            }

            return false
        }
    )

    session.setPermissionRequestHandler(
        (webContents, permission, callback) => {
            if (
                permission === "clipboard-read" ||
                permission === "clipboard-sanitized-write"
            ) {
                return callback(webContents === window.webContents)
            }

            if (permission === "display-capture") {
                return callback(webContents === window.webContents)
            }

            callback(false)
        }
    )

    /*
     * navigator.mediaDevices.getDisplayMedia()
     *
     * This handler belongs ONLY to this BrowserWindow's session.
     */
    session.setDisplayMediaRequestHandler(async (request, callback) => {
        if (request.frame?.webContents !== window.webContents) {
            return callback({})
        }

        const sources = await desktopCapturer.getSources({
            types: ["screen"]
        })

        if (!sources.length) {
            return callback({})
        }

        callback({
            video: sources[0]
        })
    })

    window.loadFile(
        path.join(__dirname, "../app/index.html")
    )
})

app.on("window-all-closed", () => app.quit());