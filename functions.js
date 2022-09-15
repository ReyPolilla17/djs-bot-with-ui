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

function createClient(wind) {
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
            Partials.Message,
            Partials.User,
            Partials.GuildMember,
            Partials.Reaction,
        ]
    });

    client.on('ready', () => {
        process.title = client.user.username;
        log(wind, `Logged in as ${client.user.username}!`);

        const configFiles = fs.readFileSync(`./config.json`);
        let config = JSON.parse(configFiles);

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

        client.guilds.cache.forEach(guild => {
            guild.invites.cache.forEach(invite => {
                log(wind, invite);
            })

            wind.webContents.send('guildList', guild.id, guild.name, guild.memberCount, guild.iconURL());
        });
    });

    client.on('guildCreate', guild => {
        wind.webContents.send('guildList', guild.id, guild.name, guild.memberCount, guild.iconURL());

        log(wind, `Joined ${guild.name} (${guild.id})`);
    });
    
    client.on('guildDelete', guild => {
        wind.webContents.send('guildRemove', guild.id);

        log(wind, `No longer in ${guild.name} (${guild.id})`);
    });

    client.on('change', async (avatar, status, activity, activityName, name, user) => {
        let usrName = client.user.username;
        let usrAvtr = client.user.avatarURL();
        let errCnt = 0;

        if(avatar) {
            let avtr = avatar;

            if(avtr.startsWith('file:///')) {
                avtr = avtr.slice(8);
            }

            await client.user.setAvatar(avtr)
            .then(() => {
                usrAvtr = avtr;
            }).catch((err) => {
                wind.webContents.send('cooldownAvatar');
                errCnt ++; 
            });
        }

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

        const configFiles = fs.readFileSync(`./config.json`);
        let config = JSON.parse(configFiles);

        config.presence.status = status;
        config.presence.activity = activity;
        config.presence.name = activityName;

        fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 4));

        wind.webContents.send('activateEdit');

        if(errCnt > 0) return;

        wind.webContents.send('successEdition');
    });

    client.on('leaveGuild', guild => {
        const gld = client.guilds.cache.get(guild);

        gld.leave();
    });

    return client;
}

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

function log(wind, log) {
    console.log(log)
    wind.webContents.send('consoleLog', log);
}