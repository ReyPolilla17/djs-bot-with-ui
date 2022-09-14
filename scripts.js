const fs = window.fncs.fs;
const renderer = window.fncs.renderer;

const confDir = fs.readdirSync('./').find(file => file === `config.json`);
	
if(!confDir) {
    const base = {};
    fs.writeFileSync(`./config.json`, JSON.stringify(base, null, 4));
}

const dir = fs.readFileSync('./config.json');
const info = new TextDecoder("utf-8").decode(dir);
const data = JSON.parse(info);

if(data.token) {
    document.querySelector('.token-wrapper').style.display = 'none';
    document.querySelector('.console-wrapper').style.display = 'block';
    document.querySelector('.bot-wrapper').style.display = 'flex';
}

function submitToken(id, err) {
    const token = document.querySelector(`#${id}`).value;
    renderer.send('submitToken', token, err, id);
}

function select(menuId, optionId) {
    document.querySelector(`#${menuId}`).firstElementChild.innerHTML = document.querySelector(`#${optionId}`).firstElementChild.innerHTML;
    document.querySelector(`#activity-error`).style.display = 'none';
    document.querySelector(`#tuser-error`).style.display = 'none';
}

// al ejecutar la función en el html se debe determinar también si es una clase o una id

function hideShow(hide, show, disp) {
    document.querySelector(`${hide}`).style.display = 'none';
    document.querySelector(`${show}`).style.display = disp;
}

function show(id, disp) {
    document.querySelector(`${id}`).style.display = disp;
}

function hide(id) {
    document.querySelector(`${id}`).style.display = 'none';
}

function disable(id) {
    document.querySelector(`#${id}`).disabled = true;
    document.querySelector(`#${id}`).value = '';
}

function enable(id) {
    document.querySelector(`#${id}`).disabled = false;
}

function transferBot() {
    const status = document.querySelector('#status').classList[0];
    const type = document.querySelector('.activity-type').innerText;
    const aName = document.querySelector('.activity-name').innerText;
    const avatar = document.getElementsByClassName('avatar')[0].src;

    
    document.getElementsByClassName('avatar')[1].src = avatar;
    document.querySelector('#botname-input').value = '';
    document.querySelector('#activity-input').value = aName === '' ? '': aName;
    document.querySelector('#avatar-input').value = '';
    document.querySelector('#default-user').className === 'null' ? document.querySelector('#tuser-input').value = '' : document.querySelector('#tuser-input').value = document.querySelector('#default-user').className;

    document.querySelector('#avatar-error').style.display = 'none';
    document.querySelector('#activity-error').style.display = 'none';
    document.querySelector('#name-error').style.display = 'none';
    document.querySelector('#tuser-error').style.display = 'none';
    document.querySelector('#change-error').style.display = 'none';

    switch(status) {
        case ('status-online'):
            document.querySelector(`#status-selector`).firstElementChild.innerHTML = document.querySelector(`#s-online`).firstElementChild.innerHTML;
            break;
        case ('status-idle'):
            document.querySelector(`#status-selector`).firstElementChild.innerHTML = document.querySelector(`#s-idle`).firstElementChild.innerHTML;
            break;
        case ('status-dnd'):
            document.querySelector(`#status-selector`).firstElementChild.innerHTML = document.querySelector(`#s-dnd`).firstElementChild.innerHTML;
            break;
        case ('status-offline'):
            document.querySelector(`#status-selector`).firstElementChild.innerHTML = document.querySelector(`#s-offline`).firstElementChild.innerHTML;
            break;
    }

    switch(type) {
        case ('Jugando a'):
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-playing`).firstElementChild.innerHTML;
            hide('.tuser-wrapper')
            break;
        case ('Transmitiendo'):
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-streaming`).firstElementChild.innerHTML;
            show('.tuser-wrapper')
            break;
        case ('Escuchando'):
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-listening`).firstElementChild.innerHTML;
            hide('.tuser-wrapper')
            break;
        case ('Viendo'):
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-watching`).firstElementChild.innerHTML;
            hide('.tuser-wrapper')
            break;
        case ('Compitiendo en'):
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-competing`).firstElementChild.innerHTML;
            hide('.tuser-wrapper')
            break;
        default:
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-none`).firstElementChild.innerHTML;
            document.querySelector('#activity-input').disabled = true;
            hide('.tuser-wrapper')
            break;
    }
}

function checkIfImageExists(url, callback) {
    const img = new Image();
    img.src = url;
    
    if(img.complete) {
        callback(true);
    } else {
        img.onload = () => {
            callback(true);
        };
      
        img.onerror = () => {
            callback(false);
        };
    }
  }

function enterLink(source) {
    const link = document.querySelector(`#${source}`).value;

    if(link === '') return document.getElementsByClassName('avatar')[1].src = document.getElementsByClassName('avatar')[0].src;

    checkIfImageExists(link, (exists) => {
        if(exists) {
            document.getElementsByClassName('avatar')[1].src = link;
        } else {
            document.querySelector('#avatar-error').innerText = 'No se encontró la imagen, intenta con otra...';
            document.querySelector('#avatar-error').style.display = 'block';
        }
    });
}

function resetAvatar() {
    document.querySelector(`#avatar-input`).value = '';
    document.getElementsByClassName('avatar')[1].src = document.getElementsByClassName('avatar')[0].src;

}

function editBot() {
    const newAvatar = document.getElementsByClassName('avatar')[0].src === document.getElementsByClassName('avatar')[1].src ? null : document.getElementsByClassName('avatar')[1].src;
    const newActivityName = document.querySelector('#activity-input').value === '' ? null : document.querySelector('#activity-input').value;
    const newActivity = parseInt(document.querySelector('#activity-selector').firstElementChild.firstElementChild.className);
    
    let newUser = document.querySelector('#tuser-input').value === '' ? null : document.querySelector('#tuser-input').value;
    let newName = document.querySelector('#botname-input').value === '' ? null : document.querySelector('#botname-input').value;
    let newStatus = parseInt(document.querySelector('#status-selector').firstElementChild.firstElementChild.className);

    const defUsr = document.querySelector('.tuser-wrapper').children[1].className === 'null' ? null : document.querySelector('.tuser-wrapper').children[1].className;

    document.querySelector('#confirm-edit').disabled = true;
    
    let err = 0;

    if(newName !== null && newName.length < 2) {
        document.querySelector('#name-error').innerText = 'El nombre es muy corto...';
        document.querySelector('#name-error').style.display = 'block';
        newName = null;
        err ++;
    }

    if(newName !== null && newName.length > 32) {
        document.querySelector('#name-error').innerText = 'El nombre es muy largo...';
        document.querySelector('#name-error').style.display = 'block';
        newName = null;
        err ++;
    }

    if(newName !== null && newName.includes('#')) {
        document.querySelector('#name-error').innerText = 'El nombre no puede tener un #...';
        document.querySelector('#name-error').style.display = 'block';
        newName = null;
        err ++;
    }

    if(newActivity !== 6 && !newActivityName) {
        document.querySelector('#activity-error').style.display = 'block';
        err ++;
    }

    if(newActivity === 1 && !newUser && !defUsr) {
        document.querySelector('#tuser-error').style.display = 'block';
        err ++;
    }

    if(newUser) {
        document.querySelector('#default-user').className = `${newUser}`;
    }

    switch(newStatus) {
        case 1:
            newStatus = 'dnd';
            break;
        case 2:
            newStatus = 'idle';
            break;
        case 3:
            newStatus = 'invisible';
            break;
        default:
            newStatus = 'online'
            break;
    }

    if(err > 0) return document.querySelector('#confirm-edit').disabled = false;
    if(document.querySelector('#avatar-error').style.visibility === 'visible') return document.querySelector('#confirm-edit').disabled = false;

    renderer.send('editBot', newAvatar, newStatus, newActivity, newActivityName, newName, newUser);
}

function resetClient() {
    renderer.send('resetClient');
    
    document.querySelector('#reset-btn').disabled = true;
    document.querySelector('#edit-btn').disabled = true;

    document.querySelector('.bot-starting').style.display = 'block';
    document.querySelector('.bot-starting').innerText = 'Tu bot está reiniciando...'
    
    document.querySelector('.bot-login').style.display = 'none';
}

function join(guild) {
    console.log(guild);
}

function leave(guild) {
    console.log(guild);
}

function send(guild) {
    console.log(guild);
}

async function openPath() {
    const url = document.getElementById('avatar-input').value === '' ? null : document.getElementById('avatar-input').value;
    if(!url) {
        renderer.send('openFile');
    } else {
        enterLink('avatar-input');
    }
}

// document.getElementsByClassName('...')[...].style.display = '...';
// const item = document.querySelector('.');
// item.style.display = 'none';
// item.style.display = 'block';
// item.innertext = var