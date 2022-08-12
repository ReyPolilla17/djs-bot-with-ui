const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const { ipcMain } = require('electron');
const fs = require('fs');

module.exports = {
    data: {
        name: 'createClient',
    },

    execute() {
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildPresences,
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.User,
            ]
        });
    
        client.on('ready', () => {
            process.title = client.user.username;
            console.log(`Logged in as ${client.user.username}!`);
    
            const configFiles = fs.readFileSync(`./config.json`);
            let config = JSON.parse(configFiles);
    
            if(config.presence.name !== null) {
                let act = config.presence.activity;
    
                switch(act) {
                    case 1:
                        act = ActivityType.Playing;
                        break;
                    case 2:
                        act = ActivityType.Streaming;
                        break;
                    case 3:
                        act = ActivityType.Listening;
                        break;
                    case 4:
                        act = ActivityType.Watching;
                        break;
                    case 5:
                        act = ActivityType.Competing;
                    default:
                        act = null
                        break;
                }
    
                client.user.setPresence({ activities: [{ name: config.presence.name, type: act }], status: config.presence.status });
            } else {
                client.user.setStatus(config.presence.status);
            }
    
            if(client.presence.activities[0]) {
                ipcMain.emit('clientStartup', 
                    client.user.username, 
                    client.user.discriminator, 
                    client.user.avatarURL(),
                    client.user.presence.status, 
                    client.presence.activities[0].name,
                    client.presence.activities[0].type
                );
            } else {
                ipcMain.emit('clientStartup', 
                    client.user.username, 
                    client.user.discriminator, 
                    client.user.avatarURL(), 
                    client.user.presence.status, 
                    null,
                    null
                );
            }
        });
    
        client.on('change', async (avatar, status, activity, activityName, name) => {
            let usrName = client.user.username;
            let usrAvtr = client.user.avatarURL();
            let errCnt = 0;
    
            if(avatar !== null) {
                let avtr = avatar;
    
                if(avtr.startsWith('file:///')) {
                    avtr = avtr.slice(8);
                }
    
                await client.user.setAvatar(avtr)
                .then(() => {
                    usrAvtr = avtr;
                }).catch((err) => {
                    ipcMain.emit('cooldownAvatar');
                    errCnt ++; 
                });
            }
    
            if(name !== null) {
                await client.user.setUsername(name).then(() => {
                    usrName = name;
                }).catch((err) => {
                    if(err.rawError.errors.username._errors[0].code === 'USERNAME_TOO_MANY_USERS') {
                        ipcMain.emit('usedName');
                    } else {
                        ipcMain.emit('cooldownName');
                    }
                    errCnt ++;
                });
            }
    
            if(activityName !== null) {
                let act = activity;
                switch(act) {
                    case 1:
                        act = ActivityType.Playing;
                        break;
                    case 2:
                        act = ActivityType.Streaming;
                        break;
                    case 3:
                        act = ActivityType.Listening;
                        break;
                    case 4:
                        act = ActivityType.Watching;
                        break;
                    case 5:
                        act = ActivityType.Competing
                    default:
                        act = null
                        break;
                }
    
                client.user.setPresence({ activities: [{ name: activityName, type: act }], status: status });
            } else {
                client.user.setPresence({ activity: null })
                client.user.setStatus(status);
            }
    
            if(client.presence.activities[0]) {
                ipcMain.emit('clientStartup', 
                    usrName, 
                    client.user.discriminator, 
                    usrAvtr,
                    client.user.presence.status, 
                    client.presence.activities[0].name,
                    client.presence.activities[0].type
                );
            } else {
                ipcMain.emit('clientStartup', 
                    usrName,
                    client.user.discriminator,
                    usrAvtr,
                    client.user.presence.status, 
                    null,
                    null
                );
            }
    
            const configFiles = fs.readFileSync(`./config.json`);
            let config = JSON.parse(configFiles);
    
            config.presence.status = status;
            config.presence.activity = activity;
            config.presence.name = activityName;
    
            fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 4));
    
            ipcMain.emit('activateEdit');
    
            if(errCnt > 0) return;
    
            ipcMain.emit('successEdition');
        });
    
        return client;
    }
}