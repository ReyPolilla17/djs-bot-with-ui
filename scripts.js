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

if(!data.token) {
    document.querySelector('.home-wrapper').classList.add('hiden');
} else {
    document.querySelector('.token-wrapper').classList.add('hiden');
}

function submitToken(id, err) {
    const token = document.querySelector(`#${id}`).value;
    renderer.send('submitToken', token, err, id);
}

function resetSubmit(id) {
    document.querySelector(`#${id}`).style.visibility = 'hidden';
}

function select(menuId, optionId) {
    document.querySelector(`#${menuId}`).firstElementChild.innerHTML = document.querySelector(`#${optionId}`).firstElementChild.innerHTML;
}

function hideShow (hide, show) {
    document.querySelector(`.${hide}`).classList.add('hiden');
    document.querySelector(`.${show}`).classList.remove('hiden');
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
            break;
        case ('Transmitiendo'):
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-streaming`).firstElementChild.innerHTML;
            break;
        case ('Escuchando'):
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-listening`).firstElementChild.innerHTML;
            break;
        case ('Viendo'):
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-watching`).firstElementChild.innerHTML;
            break;
        case ('Compitiendo'):
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-competing`).firstElementChild.innerHTML;
            break;
        default:
            document.querySelector(`#activity-selector`).firstElementChild.innerHTML = document.querySelector(`#a-none`).firstElementChild.innerHTML;
            document.querySelector('#activity-input').disabled = true;
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
            document.querySelector('#avatar-error').style.visibility = 'visible';
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
    let newName = document.querySelector('#botname-input').value === '' ? null : document.querySelector('#botname-input').value;
    const newActivity = parseInt(document.querySelector('#activity-selector').firstElementChild.firstElementChild.className);
    let newStatus = parseInt(document.querySelector('#status-selector').firstElementChild.firstElementChild.className);

    document.querySelector('#confirm-edit').disabled = true;
    
    let err = 0;

    if(newName !== null && newName.length < 2 || newName !== null && newName.length > 32) {
        document.querySelector('#name-error').innerText = 'El nombre es muy corto o muy largo...';
        document.querySelector('#name-error').style.visibility = 'visible';
        newName = null;
        err ++;
    }

    if(newName !== null && newName.includes('#')) {
        document.querySelector('#name-error').innerText = 'El nombre no puede tener un #...';
        document.querySelector('#name-error').style.visibility = 'visible';
        newName = null;
        err ++;
    }

    if(newActivity !== 0 && newActivityName === null) {
        document.querySelector('#activity-error').style.visibility = 'visible';
        err ++;
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

    renderer.send('editBot', newAvatar, newStatus, newActivity, newActivityName, newName);
}

function disable(id) {
    document.querySelector(`#${id}`).disabled = true;
    document.querySelector(`#${id}`).value = '';
}

function enable(id) {
    document.querySelector(`#${id}`).disabled = false;
}

async function openPath() {
    renderer.send('openFile');
}

// document.getElementsByClassName('...')[...].style.display = '...';
// const item = document.querySelector('.');
// item.classList.add('hiden')
// item.classList.remove('hiden')
// item.innertext = var