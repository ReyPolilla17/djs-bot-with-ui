const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const createClient = require('./client');
const path = require('path');
const fs = require('fs');
let client;

/*
    Pendientes:
        Cambiar el favicon
        Hacer que si el nombre del bot o servidor es muy largo, este se muestre via scroll
        Sección donde se vean los servidores
            - pequeña area para enviar un mensaje o embed a un canal
            - opción de unirse al servidor
            - opción de abandonar servidor (el bot)
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

    // wind.removeMenu();
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

        client = createClient.execute(wind);

        client.login(token).then(() => {
            const configFiles = fs.readFileSync(`./config.json`);
		    let config = JSON.parse(configFiles);

            config.token = token;
            
            fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 4));
            wind.webContents.send('succesLogin', id);
        }).catch(err => {
            console.log(err);
            wind.webContents.send('consoleLog', err);
            wind.webContents.send('errLogin', error, id);

            if(Rtoken) {
                client.login(Rtoken).catch(err => {
                    console.log(err);
                    wind.webContents.send('consoleLog', err);
                });
            }
        });
    });

    ipcMain.on('resetClient', () => {
        const token = client.token;

        try {
            client.destroy();
        } catch(e) {}

        client = createClient.execute(wind);
        client.login(token).catch(err => {
            console.log(err);
            wind.webContents.send('consoleLog', err);
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
        client = createClient.execute(wind);
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