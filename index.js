const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { createClient, createWindow, consultConfig, log } = require('./functions');
const fs = require('fs');
let client;

/*
    Pendientes:
        Hacer que si el nombre del bot es muy grande, este se muestre via scroll
        Sección donde se vean los servidores
            - cuenta de servidores
            - buscador de servidores, por id o nombre
            - mostrar que permisos tiene y cuales faltan para un funcionamiento optimo
            - pequeña area para enviar un mensaje o embed a un canal
*/

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

    ipcMain.on('Ready', () => {
        if(token) {
            client = createClient(wind);
            client.login(token);
        }
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

    ipcMain.on('submitToken', (event, token, error, id) => {
        let Rtoken = client ? client.token : null;

        try {
            client.destroy();
        } catch(e) {}

        client = createClient(wind);

        client.login(token).then(() => {
            const configFiles = fs.readFileSync(`./config.json`);
		    let config = JSON.parse(configFiles);

            config.token = token;
            
            fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 4));
            wind.webContents.send('succesLogin', id);
        }).catch(err => {
            log(wind, err);

            wind.webContents.send('errLogin', error, id);

            if(Rtoken) {
                client.login(Rtoken).catch(err => {
                    log(wind, err);
                });
            }
        });
    });

    ipcMain.on('resetClient', () => {
        const token = client.token;

        try {
            client.destroy();
        } catch(e) {}

        client = createClient(wind);
        client.login(token).catch(err => {
            log(wind, err);
        });
    });

    ipcMain.on('invite', (event, guild) => {
        client.emit('invite', guild);
    });

    ipcMain.on('leaveGuild', (event, guild) => {
        client.emit('leaveGuild', guild);
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

    wind.webContents.setWindowOpenHandler((link) => {
        shell.openExternal(link.url);
        
        return {
            action: 'deny'
        };
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        try {
            client.destroy();
        } catch(e) {}

        app.quit();
    }
});