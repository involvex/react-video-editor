const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
	// Example: expose a method to send messages to main process
	minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
	maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
	closeWindow: () => ipcRenderer.invoke("close-window"),

	// Platform info
	platform: process.platform,

	// Example: expose a method to receive messages from main process
	onWindowStateChanged: (callback) =>
		ipcRenderer.on("window-state-changed", callback),

	// Remove listeners
	removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
