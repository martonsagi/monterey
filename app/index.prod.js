const electron = require('electron');
const storage = require('electron-json-storage');
const app = electron.app;
const handleStartupEvent = require('./startuphandler.js');
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const update = require('./updater');
let mainWindow;
const fixPath = require('fix-path');

fixPath();

let setApplicationMenu = function() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(devMenuTemplate));
};

let devMenuTemplate = [{
  label: 'DevTools',
  submenu: [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function() {
      BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
    }
  }, {
    label: 'Toggle DevTools',
    accelerator: 'Alt+CmdOrCtrl+I',
    click: function() {
      BrowserWindow.getFocusedWindow().toggleDevTools();
    }
  }, {
    label: 'Clear session',
    click: function() {
      storage.clear(function (err){});
      BrowserWindow.getFocusedWindow().loadURL(`file://${__dirname}/index.html`);
    }
  }]
}];

// handle any Squirrel event (installer events)
if (!handleStartupEvent()) {

  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('ready', () => {
    setApplicationMenu();

    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768
    });

    global.mainWindow = mainWindow;
    global.rootDir = __dirname;

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.setTitle('Monterey');
    });

    // start checking for updates
    update(mainWindow);

    // whenever an anchor with target _blank gets opened, open this via the `open` module
    // so that the native browser is opened
    mainWindow.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      var open = require('open');
      open(url);
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  });
}


