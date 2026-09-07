const {
    app,
    BrowserWindow,
    desktopCapturer
} = require("electron");

app.whenReady().then(() => {
    const window = new BrowserWindow({
        width: 1280,
        height: 720,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const { session } = window.webContents;

    /*
     * Forward renderer console messages to the main process.
     */
    window.webContents.on("console-message", (event, level, message, line, sourceId) => {
        const levels = [
            "debug",
            "info",
            "warning",
            "error"
        ];

        console.log(
            `[renderer:${levels[level] ?? level}] ${message}` +
            ` (${sourceId}:${line})`
        );
    });

    /*
     * Forward renderer uncaught exceptions.
     */
    window.webContents.on("render-process-gone", (event, details) => {
        console.error(
            `[renderer] process gone: ${details.reason}` +
            ` (exitCode=${details.exitCode})`
        );
    });

    /*
     * Clipboard permissions
     */
    session.setPermissionCheckHandler(
        (webContents, permission) => {
            if (
                permission === "clipboard-read" ||
                permission === "clipboard-sanitized-write"
            ) {
                return webContents === window.webContents;
            }

            if (permission === "display-capture") {
                return webContents === window.webContents;
            }

            return false;
        }
    );

    session.setPermissionRequestHandler(
        (webContents, permission, callback) => {
            if (
                permission === "clipboard-read" ||
                permission === "clipboard-sanitized-write"
            ) {
                return callback(webContents === window.webContents);
            }

            if (permission === "display-capture") {
                return callback(webContents === window.webContents);
            }

            callback(false);
        }
    );

    /*
     * navigator.mediaDevices.getDisplayMedia()
     */
    session.setDisplayMediaRequestHandler(async (request, callback) => {
        if (request.frame?.webContents !== window.webContents) {
            return callback({});
        }

        try {
            const sources = await desktopCapturer.getSources({
                types: ["screen"]
            });

            if (!sources.length) {
                return callback({});
            }

            callback({
                video: sources[0]
            });
        } catch (error) {
            console.error("[renderer] display capture error:", error);
            callback({});
        }
    });

    /*
     * Load renderer.
     */
    window.loadFile("app/index.html");
});

app.on("window-all-closed", () => app.quit());