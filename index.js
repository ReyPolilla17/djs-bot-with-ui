const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const createClient = require('./client');
const path = require('path');
const fs = require('fs');
const { sandboxed } = require('process');
let client;

/*
    Pendientes:
        Cambiar el favicon
        Sección donde se vean los servidores
            - pequeña area para enviar un mensaje o embed a un canal
            - opción de unirse al servidor
            - opción de abandonar servidor (el bot)
        Sección donde se vean los errores (falta hacer que todos los console.log o console.log envien un evento a la app para escribir cada log en el area correspondiente)
*/

function consultConfig() {
    const confDir = fs.readdirSync('./').find(file => file === `config.json`);
	
    if(!confDir) {
        const base = {
            presence: {
                status: "online",
                activity: 6,
                user: null,
                name: null
            }
        };

        fs.writeFileSync(`./config.json`, JSON.stringify(base, null, 4));
    } 

    let config = fs.readFileSync(`./config.json`);
    config = JSON.parse(config);

    return config;
}

function createWindow() {
    const wind = new BrowserWindow({
        width: 840,
        height: 600,
        icon: './favicon.png',
        webPreferences: {
            sandbox: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    wind.removeMenu();
    wind.loadFile('index.html');

    return wind;
}

app.disableHardwareAcceleration();
app.whenReady().then(() => {
    let wind = createWindow();
    const config = consultConfig();

    let { token, presence } = config;
    const { user } = presence;

    app.on('activate', () => {
        // checar en una VM o algo el como se ejecuta esto, no tengo idea de que pasaría...
        if (BrowserWindow.getAllWindows().length === 0) {
            wind = createWindow();
        }
    });

    ipcMain.on('clientStartup', (name, disc, avatar, status, activity, type, usr) => {
        if(usr) {
            wind.webContents.send('clientStartup', name, disc, avatar, status, activity, type, usr);
        } else {
            wind.webContents.send('clientStartup', name, disc, avatar, status, activity, type, user);
        }
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

    ipcMain.on('editBot', (event, avatar, status, activity, activityName, name, user) => {
        let usr = user;

        if(usr) {
            let config = fs.readFileSync(`./config.json`);
            config = JSON.parse(config);

            config.presence.user = usr;

            fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
        } else {
            let config = fs.readFileSync(`./config.json`);
            config = JSON.parse(config);

            usr = config.presence.user;
        }
        
        client.emit('change', avatar, status, activity, activityName, name, usr);
    });

    ipcMain.on('successEdition', () => {
        wind.webContents.send('successEdition');
    });

    ipcMain.on('activateEdit', () => {
        wind.webContents.send('activateEdit');
    });

    ipcMain.on('submitToken', (event, token, error, id) => {
        let Rtoken = client ? client.token : null;

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

            if(Rtoken) {
                client.login(Rtoken).catch(err => {
                    console.log(err);
                });
            }
        });
    });

    ipcMain.on('resetClient', () => {
        const token = client.token;

        try {
            client.destroy();
        } catch(e) {}

        client = createClient.execute();
        client.login(token).catch(err => {
            console.log(err);
        });
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

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();

        try {
            client.destroy();
        } catch(e) {}
    }
});