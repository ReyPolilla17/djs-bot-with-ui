const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { createClient, createWindow, createChild, consultConfig, log } = require('./functions');
const fs = require('fs');

// esta variable global me daría un 0 en programación
let client;

/*
    Pendientes:
    Sección donde se vean los servidores
            - Actualización de la info del servidor en caso de cambio
            - mostrar que permisos tiene y cuales faltan para un funcionamiento optimo
            - Mostrar la fecha de creación del servidor, dueño y desde cuando pertenece el bot
            - pequeña area para enviar un mensaje o embed a un canal
*/

app.disableHardwareAcceleration();

// todo el código se ejecuta una vez está lista la instancia de electron
app.whenReady().then(() => {
    // se guarda wind como let para poder modificarla en cualquier momento
    let wind = createWindow();

    // config es el archivo config.json en el que se aloja la información de inicio de sesion del bot
    const config = consultConfig();
    let { token, presence } = config;
    const { user } = presence;

    // se supone que esto funciona para MacOs, que en lugar de cerrar por completo el programa, lo deja en espera
    app.on('activate', () => {
        // checar en una VM o algo el como se ejecuta esto, no tengo idea de que pasaría...
        if (BrowserWindow.getAllWindows().length === 0) {
            wind = createWindow();
        }
    });

    // cunando la ventana esté lista, se crea una instancia de bot y se inicia sesion con el token almacenado en config.json
    ipcMain.on('Ready', () => {
        if(token) {
            client = createClient(wind);
            client.login(token);
        }
    });

    // este evento se dispara cuando se edita el bot desde la GUI, cambia todos los valores posibles
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

    // cambia el token de config.json e inicia sesion como un nuevo bot, destruyendo el anterior, si es que existe
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

    // para reiniciar el bot, elimina la instancia de bot y la vuelve a crear
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

    // si el usuario solicita una invitación, le envia la solicitud al bot, que se encarga de obtener la liga y regresarla a la ventana de la GUI
    ipcMain.on('invite', (event, guild, newInv) => {
        client.emit('invite', guild, newInv);
    });

    // le da la instrucción al cliente de abandonar un servidor
    ipcMain.on('leaveGuild', (event, guild) => {
        client.emit('leaveGuild', guild);
    });

    ipcMain.on('openChild', (event, modal) => {
        let child = createChild(wind, modal);
    });

    // se usa para abrir imagenes (cambio de avatar)
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