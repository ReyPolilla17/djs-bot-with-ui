const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

// Elementos a usar mientras el programa se ejecuta
const functions = {
    fs: fs,
    renderer: ipcRenderer,
}

// Si el bot no puede iniciarse correctamente
ipcRenderer.on('errLogin', (event, err, id) => {
    // muestra la advertencia
    document.querySelector(`#${err}`).style.display = 'block';
    document.querySelector(`#${id}`).value = '';
});

// Si se inicia sesión correctamente por primera vez
ipcRenderer.on('succesLogin', (event, id) => {
    // se oculta la pantalla del token y se muestra la info del bot
    document.querySelector('.token-wrapper').style.display = 'none';
    document.querySelector('.edition-wrapper').style.display = 'none';
    document.querySelector('.bot-wrapper').style.display = 'flex';
    document.querySelector('.console-wrapper').style.display = 'block';

    document.querySelector(`#${id}`).value = '';
});

// Cuando el bot inicia sesion independientemente de cuando sea
ipcRenderer.on('clientStartup', (event, name, disc, avatar, status, activity, type, user, isNew, newInv) => {
    // cada parte de la tarjeta del bot
    document.querySelector('.bot-starting').style.display = 'none';
    document.querySelector('.bot-login').style.display = 'flex';
    document.querySelector('.bot-name').innerText = name;
    document.querySelector('.bot-disc').innerText = `#${disc}`;
    document.getElementsByClassName('avatar')[0].src = avatar;
    document.getElementsByClassName('avatar')[1].src = avatar;

    document.querySelector('#edit-btn').disabled = false;
    document.querySelector('#reset-btn').disabled = false;
    document.querySelector('#reset-btn').innerText = 'Reiniciar';
    document.querySelector('.bot-starting').innerText = 'Tu bot está iniciando sesión...';

    document.querySelector('#invite-checkbox').disabled = false;
    document.querySelector('#search-input').disabled = false;

    if(isNew) {
        document.querySelector('.guilds').innerHTML = '';
    }

    if(newInv === true) {
        document.getElementById('invite-checkbox').checked = true;
    } else {
        document.getElementById('invite-checkbox').checked = false;
    }
    
    document.title = name;

    if(user) {
        document.querySelector('#default-user').classList = user;
    }

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
                document.querySelector('#status').classList = 'status-streaming';
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
                document.querySelector('.activity-type').innerText = 'Compitiendo en';
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

ipcRenderer.on('guildList', (event, id, name, mCount, image, gldSize) => {
    const src = image ? image : 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    const def = 
    `<div class="guild">
        <div id="${id}"></div>

        <div class="guild-image">
            <img src="${src}" alt="Guild Icon" class="icon">
        </div>

        <div class="guild-info">
            <div class="guild-name">${name}</div>
            <div class="guild-members">${mCount} Miembros</div>
        </div>
    </div>
    
    <div class="buttons-wrapper">
        <button type="submit" class="green-btn" onclick="inviteRequest(this.parentElement.parentElement.firstChild.firstElementChild.id)">Unirse</button>
        <button type="submit" class="red-btn" onclick="leaveRequest(this.parentElement.parentElement.firstChild.firstElementChild.id)">Abandonar</button>
        <button type="submit" class="blue-btn" onclick="send(this.parentElement.parentElement.firstChild.firstElementChild.id)">Enviar</button>
        <i class="fa-solid fa-circle-info"></i>
    </div>
    
    <div class="confirm-message" id="leave-confirm">
        <div class="message">
            ¿Abandonar servidor?
        </div>

        <div class="buttons-wrapper">
            <button type="submit" class="green-btn" onclick="leave(this.parentElement.parentElement.parentElement.firstChild.firstElementChild.id, this.parentElement.parentElement.parentElement)">Confirmar</button>
            <button type="submit" class="red-btn" onclick="hideChildren(this.parentElement.parentElement.parentElement, 2)">Cancelar</button>
        </div>
    </div>
    
    <div class="confirm-message" id="invite-confirm">
        <div class="message">
            ¿Unirse al servidor?
        </div>

        <div class="buttons-wrapper">
            <button type="submit" class="green-btn" onclick="createInvite(this.parentElement.parentElement.parentElement.firstChild.firstElementChild.id)">Confirmar</button>
            <button type="submit" class="red-btn" onclick="hideChildren(this.parentElement.parentElement.parentElement, 3)">Cancelar</button>
        </div>
    </div>
    `;

    const guildCard = document.createElement("div");
    guildCard.classList.add('guild-wrapper');
    guildCard.innerHTML = def;
    document.querySelector('.guilds').appendChild(guildCard);

    document.getElementById('extra-display').firstElementChild.lastElementChild.innerText = `Servidores (${gldSize})`;
    document.getElementById('c-servers').firstElementChild.lastElementChild.innerText = `Servidores (${gldSize})`;
});

ipcRenderer.on('guildRemove', (event, id, gldSize) => {
    document.getElementById(id).parentElement.parentElement.remove();

    document.getElementById('extra-display').firstElementChild.lastElementChild.innerText = `Servidores (${gldSize})`;
    document.getElementById('c-servers').firstElementChild.lastElementChild.innerText = `Servidores (${gldSize})`;
});

ipcRenderer.on('consoleLog', (event, log) => {
    document.querySelector('.client').innerHTML = `${document.querySelector('.client').innerHTML} ${log} <br>`;
});

ipcRenderer.on('imagePath', (event, path) => {
    document.getElementsByClassName('avatar')[1].src = path;
});

ipcRenderer.on('cooldownAvatar', () => {
    document.querySelector('#avatar-error').innerText = 'Has cambiado muchas veces este campo, intenta más tarde...';
    document.querySelector('#avatar-error').style.display = 'block';
});

ipcRenderer.on('cooldownName', () => {
    document.querySelector('#name-error').innerText = 'Has cambiado muchas veces este campo, intenta más tarde...';
    document.querySelector('#name-error').style.display = 'block';
});

ipcRenderer.on('usedName', () => {
    document.querySelector('#name-error').innerText = 'Ese nombre está muy usado, intenta con otro...';
    document.querySelector('#name-error').style.display = 'block';
});

ipcRenderer.on('successEdition', () => {
    document.querySelector('.edition-wrapper').style.display = 'none';
    document.querySelector('.bot-wrapper').style.display = 'flex';
    document.querySelector('.console-wrapper').style.display = 'block';
});

ipcRenderer.on('inviteCode', (event, code, id) => {
    const children = document.getElementById(`${id}`).parentElement.parentElement;

    window.open(`https://discord.gg/${code}`);
    
    children.children[0].style.display = 'flex';
    children.children[1].style.display = 'block';
    children.children[3].style.display = 'none';
});

ipcRenderer.on('noInvite', (event, id) => {
    const children = document.getElementById(`${id}`).parentElement.parentElement;
    
    children.children[3].firstElementChild.innerText = 'Sin invitación';
    children.children[3].lastElementChild.firstElementChild.disabled = true;
    
    setTimeout(() => {
        children.children[3].firstElementChild.innerText = '¿Unirse al servidor?';
        children.children[3].lastElementChild.firstElementChild.disabled = false;
    }, 2000);
});

ipcRenderer.on('activateEdit', () => {
    document.querySelector('#confirm-edit').disabled = false;
});

contextBridge.exposeInMainWorld('fncs', functions);