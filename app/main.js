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

    // session.setPermissionCheckHandler(() => true);

    // session.setPermissionRequestHandler((webContents, permission, callback) => callback(true));

    /*
     * navigator.mediaDevices.getDisplayMedia()
     */
    session.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({
            types: ["screen"]
        }).then(([source]) => callback({ video: source }));
    });

    /*
     * Load renderer.
     */
    window.loadFile("app/index.html");
});

app.on("window-all-closed", () => app.quit());