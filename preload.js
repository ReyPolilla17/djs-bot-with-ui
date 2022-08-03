const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

const functions = {
    fs: fs,
    renderer: ipcRenderer
}

ipcRenderer.on('errLogin', (event, err, id) => {
    document.querySelector(`#${err}`).style.visibility = 'visible';
    document.querySelector(`#${id}`).value = '';
});

ipcRenderer.on('succesLogin', (event, id) => {
    document.querySelector('.token-wrapper').classList.add('hiden');
    document.querySelector('.edition-wrapper').classList.add('hiden');
    document.querySelector('.home-wrapper').classList.remove('hiden');

    document.querySelector(`#${id}`).value = '';
});

ipcRenderer.on('clientStartup', (event, name, disc, avatar, status, activity, type) => {
    document.querySelector('.bot-starting').classList.add('hiden');
    document.querySelector('#login').classList.add('bot-login');
    document.querySelector('.bot-name').innerText = name;
    document.querySelector('.bot-disc').innerText = `#${disc}`;
    document.getElementsByClassName('avatar')[0].src = avatar;
    document.getElementsByClassName('avatar')[1].src = avatar;
    document.querySelector('#edit-btn').disabled = false

    switch(status) {
        case 'online':
            document.querySelector('#status').removeAttribute('class');
            document.querySelector(`#status-selector`).firstElementChild.innerHTML = document.querySelector(`#s-online`).firstElementChild.innerHTML;
            document.querySelector('#status').classList.add('status-online');
            break;
        case 'idle':
            document.querySelector('#status').removeAttribute('class');
            document.querySelector('#status').classList.add('status-idle');
            break;
        case 'dnd':
            document.querySelector('#status').removeAttribute('class');
            document.querySelector('#status').classList.add('status-dnd');
            break;
        default:
            document.querySelector('#status').removeAttribute('class');
            document.querySelector('#status').classList.add('status-offline');
            break;
    }

    if(type !== null && activity !== null) {
        switch(type) {
            case 0:
                document.querySelector('.activity-type').innerText = 'Jugando a';
                document.querySelector('.activity-name').innerText = activity;
                break;
            case 1:
                document.querySelector('.activity-type').innerText = 'Transmitiendo';
                document.querySelector('.activity-name').innerText = activity;
                break;
            case 2:
                document.querySelector('.activity-type').innerText = 'Escuchando';
                document.querySelector('.activity-name').innerText = activity;
                break;
            case 3:
                document.querySelector('.activity-type').innerText = 'Viendo';
                document.querySelector('.activity-name').innerText = activity;
                break;
            case 5:
                document.querySelector('.activity-type').innerText = 'Compitiendo';
                document.querySelector('.activity-name').innerText = activity;
                break;
            default:
                document.querySelector('.activity-type').innerText = type;
                document.querySelector('.activity-name').innerText = activity;
                break;
        }
    } else {
        document.querySelector('.activity-type').innerText = '';
        document.querySelector('.activity-name').innerText = '';
    }
});

ipcRenderer.on('imagePath', (event, path) => {
    document.getElementsByClassName('avatar')[1].src = path;
});

ipcRenderer.on('cooldownAvatar', () => {
    document.querySelector('#avatar-error').innerText = 'Has cambiado muchas veces este campo, intenta más tarde...';
    document.querySelector('#avatar-error').style.visibility = 'visible';
});

ipcRenderer.on('cooldownName', () => {
    document.querySelector('#name-error').innerText = 'Has cambiado muchas veces este campo, intenta más tarde...';
    document.querySelector('#name-error').style.visibility = 'visible';
});

ipcRenderer.on('usedName', () => {
    document.querySelector('#name-error').innerText = 'Ese nombre está muy usado, intenta con otro...';
    document.querySelector('#name-error').style.visibility = 'visible';
});

ipcRenderer.on('successEdition', () => {
    document.querySelector('.edition-wrapper').classList.add('hiden');
    document.querySelector('.home-wrapper').classList.remove('hiden');
});

ipcRenderer.on('activateEdit', () => {
    document.querySelector('#confirm-edit').disabled = false;
});

contextBridge.exposeInMainWorld('fncs', functions);