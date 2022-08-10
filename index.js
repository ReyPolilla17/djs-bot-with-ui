const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { token } = require('./config.json');
const createClient = require('./client');
const path = require('path');
const fs = require('fs');
let client;

/*
    Ideas:
        Cambiar el favicon
        Sección donde se vean los servidores
        Sección donde se vean los errores
*/

app.disableHardwareAcceleration();

app.whenReady().then(() => {
    const wind = new BrowserWindow({
        width: 840,
        height: 600,
        icon: './favicon.png',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // wind.removeMenu();
    wind.loadFile('index.html');

    ipcMain.on('clientStartup', (name, disc, avatar, status, activity, type) => {
        wind.webContents.send('clientStartup', name, disc, avatar, status, activity, type);
    });

    ipcMain.on('cooldownAvatar', () => {
        wind.webContents.send('cooldownAvatar');
    });

    ipcMain.on('cooldownName', () => {
        wind.webContents.send('cooldownName');
    });

    ipcMain.on('usedName', () => {
        wind.webContents.send('usedName');
    });

    ipcMain.on('editBot', (event, avatar, status, activity, activityName, name) => {
        client.emit('change', avatar, status, activity, activityName, name);
    });

    ipcMain.on('successEdition', () => {
        wind.webContents.send('successEdition');
    });

    ipcMain.on('activateEdit', () => {
        wind.webContents.send('activateEdit');
    });

    ipcMain.on('submitToken', (event, token, error, id) => {
        try {
            client.destroy();
        } catch(e) {}

        client = createClient.execute();

        client.login(token).then(() => {
            const configFiles = fs.readFileSync(`./config.json`);
		    let config = JSON.parse(configFiles);

            config.token = token;
            
            fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 4));
            wind.webContents.send('succesLogin', id);
        }).catch(err => {
            console.log(err);
            wind.webContents.send('errLogin', error, id);
        });
    });

    ipcMain.on('resetClient', () => {
        const token = client.token;

        try {
            client.destroy();
        } catch(e) {}

        client = createClient.execute();
        client.login(token);
    });

    ipcMain.on('openFile', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }
            ]
        });
    
        if (canceled) {
            return;
        } else {
            wind.webContents.send('imagePath', filePaths[0]);
        }
    });

    if(token) {
        client = createClient.execute();
        client.login(token);
    }
});