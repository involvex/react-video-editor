const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");

const isDevelopment =
	process.env.NODE_ENV === "development" ||
	process.env.ELECTRON_IS_DEV === "true";

let server = null;

function startServer() {
	if (isDevelopment) {
		return; // Don't start server in development
	}

	const staticPath = path.join(__dirname, "../../out");

	// Create a simple HTTP server to serve static files
	server = http.createServer((req, res) => {
		// Normalize the URL path
		const urlPath = req.url;

		// Handle root route explicitly
		if (urlPath === "/") {
			// Serve index.html for root route
			const indexPath = path.join(staticPath, "index.html");
			fs.readFile(indexPath, (err, data) => {
				if (err) {
					console.error("Error reading index.html:", err);
					res.writeHead(404);
					res.end("Index file not found");
				} else {
					res.writeHead(200, {
						"Content-Type": "text/html",
						"Cache-Control": "no-cache",
					});
					res.end(data);
				}
			});
			return;
		}

		// Check if it's a static file request (has extension or is in _next directory)
		const isStaticFile = urlPath.includes(".") || urlPath.startsWith("/_next/");

		if (isStaticFile) {
			// Try to serve the static file
			const filePath = path.join(staticPath, urlPath);
			fs.readFile(filePath, (err, data) => {
				if (err) {
					console.error("Error reading static file:", filePath, err);
					res.writeHead(404);
					res.end("File not found");
				} else {
					// Set appropriate content type based on file extension
					const ext = path.extname(filePath);
					let contentType = "text/plain";

					switch (ext) {
						case ".html":
							contentType = "text/html";
							break;
						case ".css":
							contentType = "text/css";
							break;
						case ".js":
							contentType = "text/javascript";
							break;
						case ".json":
							contentType = "application/json";
							break;
						case ".png":
							contentType = "image/png";
							break;
						case ".jpg":
						case ".jpeg":
							contentType = "image/jpeg";
							break;
						case ".svg":
							contentType = "image/svg+xml";
							break;
						case ".ico":
							contentType = "image/x-icon";
							break;
						case ".woff":
							contentType = "font/woff";
							break;
						case ".woff2":
							contentType = "font/woff2";
							break;
						case ".ttf":
							contentType = "font/ttf";
							break;
						case ".eot":
							contentType = "application/vnd.ms-fontobject";
							break;
					}

					res.writeHead(200, {
						"Content-Type": contentType,
						"Cache-Control": "public, max-age=31536000",
					});
					res.end(data);
				}
			});
		} else {
			// Handle client-side routing - serve index.html for SPA routes
			const indexPath = path.join(staticPath, "index.html");
			fs.readFile(indexPath, (err, data) => {
				if (err) {
					console.error("Error reading index.html for SPA route:", err);
					res.writeHead(404);
					res.end("Index file not found");
				} else {
					res.writeHead(200, {
						"Content-Type": "text/html",
						"Cache-Control": "no-cache",
					});
					res.end(data);
				}
			});
		}
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
