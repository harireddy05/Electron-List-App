const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

// To Publish
// https://www.christianengvall.se/electron-packager-tutorial/

// Set ENV (Production Mode to Hide Dev Tools)
//process.env.NODE_ENV = 'production';

// To suppress the security warning that shows up on dev mode due to the name of the binary being Electron
//process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

let mainWindow;
let addWindow;

// Listen for the app to be ready
app.on('ready', function () {
    // Create new Window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
        }
    });
    // Load HTML file into the window
    // returns file://dirname(current-directory)/mainWindow.html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit app when main window is closed
    mainWindow.on('closed', function () {
        app.quit();
    })

    // Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);

})

// Handle creating add window (add item)
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 400,
        height: 200,
        title: 'Add List Item'
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    addWindow.setMenuBarVisibility(false);

    // Garbage collection handle
    addWindow.on('close', function () {
        addWindow = null;
    })
}

// Catch the item:add and send to window
ipcMain.on('item:add', function (e, item) {
    //console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

ipcMain.on('action_AddWindow', function (e) {
    createAddWindow();
})

// Create Menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                accelerator: process.platform == 'darwin' ? 'Command+D' : 'Ctrl+D',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
]

// If Mac, add empty object to Menu (Electron instead of File)
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({}); //unshift adds to the beginning
}

/* 
// Add developer tools item if not in production mode
if (process.env.node.env !== 'production') {
    mainMenuTemplate.push({
        label: 'Dev Tools',
        submenu: [
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }

        ]
    })
}
*/