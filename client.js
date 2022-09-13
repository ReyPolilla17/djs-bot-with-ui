const { Client, GatewayIntentBits, Partials } = require('discord.js');
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
            ipcMain.emit('consoleLog', `Logged in as ${client.user.username}!`);
    
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
                ipcMain.emit('clientStartup', 
                    client.user.username, 
                    client.user.discriminator, 
                    client.user.avatarURL(),
                    client.user.presence.status, 
                    client.presence.activities[0].name,
                    client.presence.activities[0].type,
                    config.presence.user
                );
            } else {
                ipcMain.emit('clientStartup', 
                    client.user.username, 
                    client.user.discriminator, 
                    client.user.avatarURL(), 
                    client.user.presence.status, 
                    null,
                    null,
                    config.presence.user
                );
            }
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
                    ipcMain.emit('cooldownAvatar');
                    errCnt ++; 
                });
            }
    
            if(name) {
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
                ipcMain.emit('clientStartup', 
                    usrName, 
                    client.user.discriminator, 
                    usrAvtr,
                    client.user.presence.status, 
                    client.presence.activities[0].name,
                    client.presence.activities[0].type,
                    user
                );
            } else {
                ipcMain.emit('clientStartup', 
                    usrName,
                    client.user.discriminator,
                    usrAvtr,
                    client.user.presence.status, 
                    null,
                    null,
                    user
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