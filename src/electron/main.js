const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const isDev = require("electron-is-dev");
const express = require("express");

const isDevelopment = process.env.NODE_ENV === "development" || isDev;

let server = null;

function startServer() {
	if (isDevelopment) {
		return; // Don't start server in development
	}

	const staticPath = path.join(__dirname, "../out");
	server = express();

	// Serve all files from the out directory
	server.use(express.static(staticPath));

	// Handle client-side routing - serve index.html for all routes
	server.get("*", (req, res) => {
		res.sendFile(path.join(staticPath, "index.html"));
	});

	server.listen(0, () => {
		console.log(`Server running on port ${server.address().port}`);
	});
}

function createWindow() {
	const win = new BrowserWindow({
		width: 1500,
		height: 900,
		minWidth: 600,
		minHeight: 700,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
			webSecurity: false, // Allow loading from localhost
			allowRunningInsecureContent: false,
		},
		icon: path.join(__dirname, "..", "..", "assets", "icon.png"), // Add icon path
		show: false, // Don't show until ready-to-show
	});

	// Show window when ready to prevent visual flash
	win.once("ready-to-show", () => {
		win.show();
	});

	if (isDevelopment) {
		win.loadURL("http://localhost:3000");
		win.webContents.openDevTools();
	} else {
		// In production, load from the local Express server
		const port = server ? server.address().port : 3000;
		win.loadURL(`http://localhost:${port}`);
	}
}

app.whenReady().then(() => {
	// Start the server in production
	startServer();

	// Wait a bit for the server to start before creating the window
	setTimeout(() => {
		createWindow();
	}, 100);

	// IPC handlers for window controls
	ipcMain.handle("minimize-window", () => {
		const win = BrowserWindow.getFocusedWindow();
		if (win) win.minimize();
	});

	ipcMain.handle("maximize-window", () => {
		const win = BrowserWindow.getFocusedWindow();
		if (win) {
			if (win.isMaximized()) {
				win.unmaximize();
			} else {
				win.maximize();
			}
		}
	});

	ipcMain.handle("close-window", () => {
		const win = BrowserWindow.getFocusedWindow();
		if (win) win.close();
	});

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	// Clean up the server
	if (server) {
		server.close();
	}
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("before-quit", () => {
	// Clean up the server before quitting
	if (server) {
		server.close();
	}
});
