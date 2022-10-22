const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

module.exports = {
    createClient,
    createWindow,
    consultConfig,
    log
}

// crea el bot
function createClient(wind) {
    // elementos con los que interactua
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildInvites,
        ],
        partials: [
            Partials.Channel,
            Partials.GuildMember,
            Partials.Message,
            Partials.Reaction,
            Partials.User,
        ]
    });

    // al iniciarse
    client.on('ready', () => {
        // el nombre de la consola cambia al del bot y registra en la consola que inició sesión
        process.title = client.user.username;
        log(wind, `Logged in as ${client.user.username}!`);

        // checa config.json
        const configFiles = fs.readFileSync(`./config.json`);
        let config = JSON.parse(configFiles);

        // si hay una actividad la pone al igual que el estatus
        if(config.presence.name) {
            let act = config.presence.activity;

            if(config.presence.user) {
                client.user.setPresence({ activities: [{ name: config.presence.name, type: act, url: `https://twitch.tv/${config.presence.user}` }], status: config.presence.status });
            } else {
                client.user.setPresence({ activities: [{ name: config.presence.name, type: act }], status: config.presence.status });
            }
        } else {
            client.user.setStatus(config.presence.status);
        }

        // envia la información a la GUI
        if(client.presence.activities[0]) {
            wind.webContents.send('clientStartup', 
                client.user.username, 
                client.user.discriminator, 
                client.user.avatarURL(),
                client.user.presence.status, 
                client.presence.activities[0].name,
                client.presence.activities[0].type,
                config.presence.user,
                true
            );
        } else {
            wind.webContents.send('clientStartup', 
                client.user.username, 
                client.user.discriminator, 
                client.user.avatarURL(), 
                client.user.presence.status, 
                null,
                null,
                config.presence.user,
                true
            );
        }

        // envia los servidores en los que está el bot
        // envia la invitación, usuarios, nombre, id e imagen

        client.guilds.cache.forEach(async guild => {
            wind.webContents.send('guildList', guild.id, guild.name, guild.memberCount, guild.iconURL());
        });
    });

    // al unirse a un servidor lo agrega a la lista y lo registra en la conosla
    client.on('guildCreate', async guild => {
        wind.webContents.send('guildList', guild.id, guild.name, guild.memberCount, guild.iconURL());

        log(wind, `Joined ${guild.name} (${guild.id})`);
    });
    
    // al abandonar el servidor, lo elimina de la lista y lo registra en la consola
    client.on('guildDelete', guild => {
        wind.webContents.send('guildRemove', guild.id);

        log(wind, `No longer in ${guild.name} (${guild.id})`);
    });

    // cambio de información del bot
    // si la cuenta de errores es superior a 0 no lo ejecuta
    client.on('change', async (avatar, status, activity, activityName, name, user) => {
        let usrName = client.user.username;
        let usrAvtr = client.user.avatarURL();
        let errCnt = 0;

        // si se quiere cambiar el avatar se revisa si se puede cambiar
        if(avatar) {
            let avtr = avatar;

            // si el avatar viene del equipo se tiene que eliminar la cadena inicial (file:///)
            if(avtr.startsWith('file:///')) {
                avtr = avtr.slice(8);
            }

            // el unico error que puede llegar a esta etapa es el que se da cuando se cambia mjucho de avatar
            // aqui se captura y se envia como error a la GUI
            await client.user.setAvatar(avtr)
            .then(() => {
                usrAvtr = avtr;
            }).catch((err) => {
                wind.webContents.send('cooldownAvatar');
                errCnt ++; 
            });
        }

        // si se quiere cambiar el nombre, ser revisa que se pueda
        // hay 2 posibles errores: que muchos usuarios tengan el nombre o que se haya cambiado mucho de nombre
        // aqui se capturan y se envian a la GUI
        if(name) {
            await client.user.setUsername(name).then(() => {
                usrName = name;
            }).catch((err) => {
                if(err.rawError.errors.username._errors[0].code === 'USERNAME_TOO_MANY_USERS') {
                    wind.webContents.send('usedName');
                } else {
                    wind.webContents.send('cooldownName');
                }
                errCnt ++;
            });
        }

        // si se quiere cambiar de actividad, aqui se registran todas las opciones
        if(activityName) {
            if(activity === 1 && user) {
                client.user.setPresence({ activities: [{ name: activityName, type: activity, url: `https://twitch.tv/${user}` }], status: status });
            } else {
                client.user.setPresence({ activities: [{ name: activityName, type: activity }], status: status });
            }
        } else {
            client.user.setPresence({ activity: null });
            client.user.setStatus(status);
        }

        // se envia la nueva informacion a la GUI
        if(client.presence.activities[0]) {
            wind.webContents.send('clientStartup', 
                usrName, 
                client.user.discriminator, 
                usrAvtr,
                client.user.presence.status, 
                client.presence.activities[0].name,
                client.presence.activities[0].type,
                user,
                false
            );
        } else {
            wind.webContents.send('clientStartup', 
                usrName,
                client.user.discriminator,
                usrAvtr,
                client.user.presence.status, 
                null,
                null,
                user,
                false
            );
        }

        // se escriben los nuevos valores en config.json
        const configFiles = fs.readFileSync(`./config.json`);
        let config = JSON.parse(configFiles);

        config.presence.status = status;
        config.presence.activity = activity;
        config.presence.name = activityName;

        fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 4));

        // se habilita la opción de editar
        wind.webContents.send('activateEdit');

        // si hay algun error no confirma la edición
        if(errCnt > 0) return;

        // la edición fue exitosa
        wind.webContents.send('successEdition');
    });

    // Al pedirle unirse al servidor, te da una invitación o crea una
    client.on('invite', async guildId => {
        const guild = client.guilds.cache.get(guildId);

        // revisa si hay invitaciones, si no hay ninguna a la que pueda acceder, crea una
        const invs = await guild.invites.fetch().catch((e) => {
            if(e.rawError.code !== 50013) {
                console.error(e.rawError.code);
            }

            return null;    
        });

        // comprueba si existen invitaciones
        const invite = invs?.first() ? invs.first() : await guild.channels.cache.first().createInvite();

        wind.webContents.send('inviteCode', `${invite}`);
    });

    // cuando se soliciata que se abandone un servidor, lo abandona
    client.on('leaveGuild', guild => {
        const gld = client.guilds.cache.get(guild);

        gld.leave();
    });

    return client;
}

// revisa config.json y regresa el contenido del archivo
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

// crea la ventana de la GUI cargando un html
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

// hace que los console.log tambien se muestren en la consola de la GUI
function log(wind, log) {
    console.log(log)
    wind.webContents.send('consoleLog', log);
}