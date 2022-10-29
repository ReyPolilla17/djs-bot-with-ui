// definir que es fs y renderer (solamente para fines prácticos)
const fs = window.fncs.fs;
const renderer = window.fncs.renderer;

// Revisar config.json en busca del token

const confDir = fs.readdirSync('./').find(file => file === `config.json`);

// si no existe el archivo, lo crea
	
if(!confDir) {
    const base = {
        presence: {
            status: "online",
            activity: 6,
            user: null,
            name: null
        },
        newInv: false
    };

    fs.writeFileSync(`./config.json`, JSON.stringify(base, null, 4));
}

// definir el archivo, en que base se codifica el archivo y pasarlo a texto legible

const dir = fs.readFileSync('./config.json');
const info = new TextDecoder("utf-8").decode(dir);
const data = JSON.parse(info);

// si ya hay un token pasar al area del bot (el area donde se ve la info del bot)

if(data.token) {
    document.querySelector('.token-wrapper').style.display = 'none';
}

// decirle a index.js que se puede crear el bot

renderer.send('Ready');

// se ejecuta al enviar un token nuevo
// id es el campo en el que se mando (inicio o edicion)
// err es cual mensaje de error se mostrará en caso de error

function submitToken(id, err) {
    const token = document.querySelector(`#${id}`).value;
    renderer.send('submitToken', token, err, id);
}

// se ejecuta al elegir en un menu
// selecciona la opcion y oculta cualquier error relacionado

function select(menuId, optionId) {
    document.querySelector(`#${menuId}`).firstElementChild.innerHTML = document.querySelector(`#${optionId}`).firstElementChild.innerHTML;
    document.querySelector(`#activity-error`).style.display = 'none';
    document.querySelector(`#tuser-error`).style.display = 'none';
}

// funciones para mostrar y ocultar
// usa la clase del objeto incluido el . o el # en caso de id y  como se debe mostrar

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

// desactivar, activar botones o campos (usa la id del objeto)

function disable(id, reset) {
    document.querySelector(`#${id}`).disabled = true;
    
    if(reset !== false) {
        document.querySelector(`#${id}`).value = '';
    }
}

function enable(id) {
    document.querySelector(`#${id}`).disabled = false;
}

// pasa la info del bot al area de edición

function transferBot() {
    // como el estatus puede cambiar se toma el campo desde una id el resto de campos se toman en "bruto"
    const status = document.querySelector('#status').classList[0];
    const type = document.querySelector('.activity-type').innerText;
    const aName = document.querySelector('.activity-name').innerText;
    const avatar = document.getElementsByClassName('avatar')[0].src;

    // resetea los campos editables
    document.getElementsByClassName('avatar')[1].src = avatar;
    document.querySelector('#botname-input').value = '';
    document.querySelector('#activity-input').value = aName === '' ? '': aName;
    document.querySelector('#avatar-input').value = '';
    document.querySelector('#default-user').className === 'null' ? document.querySelector('#tuser-input').value = '' : document.querySelector('#tuser-input').value = document.querySelector('#default-user').className;

    // oculta cualquier error
    document.querySelector('#avatar-error').style.display = 'none';
    document.querySelector('#activity-error').style.display = 'none';
    document.querySelector('#name-error').style.display = 'none';
    document.querySelector('#tuser-error').style.display = 'none';
    document.querySelector('#change-error').style.display = 'none';

    // como mostrar cada estado
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

    // como mostrar cada actividad
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

// revisar si existe la imagen dada por el usuario basado en si se puede crear una imagen o no con el link dado
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

// al introducir el link para una imagen se realiza la confirmación para saber si se puede poner o no
function enterLink(source) {
    const link = document.querySelector(`#${source}`).value;

    if(link === '') return document.getElementsByClassName('avatar')[1].src = document.getElementsByClassName('avatar')[0].src;

    checkIfImageExists(link, (exists) => {
        if(exists) {
            document.getElementsByClassName('avatar')[1].src = link;
        } else {
            document.querySelector('#avatar-error').innerText = 'No se encontró la imagen, intenta con otra...';
            document.querySelector('#avatar-error').style.display = 'block';
            document.querySelector(`#${source}`).value = ''
        }
    });
}

// vuelve al avatar inicial antes de la edición
function resetAvatar() {
    document.querySelector(`#avatar-input`).value = '';
    document.getElementsByClassName('avatar')[1].src = document.getElementsByClassName('avatar')[0].src;
}

// manda la información a editar en el bot, si hay algun error no manda nada para no sobrecargar al bot de errores
function editBot() {
    // si hay avatar, actividad, o tipo de actividad nuevo los guarda
    // (estos son confirmados antes por lo que no será necesario poder editarlos)
    const newAvatar = document.getElementsByClassName('avatar')[0].src === document.getElementsByClassName('avatar')[1].src ? null : document.getElementsByClassName('avatar')[1].src;
    const newActivityName = document.querySelector('#activity-input').value === '' ? null : document.querySelector('#activity-input').value;
    const newActivity = parseInt(document.querySelector('#activity-selector').firstElementChild.firstElementChild.className);
    
    // si existe uno nuevo los guarda, pero se pueden editar ya que podrian estar mal
    // el estatus lo identifica con numeros, por eso se usa el parseInt
    let newUser = document.querySelector('#tuser-input').value === '' ? null : document.querySelector('#tuser-input').value;
    let newName = document.querySelector('#botname-input').value === '' ? null : document.querySelector('#botname-input').value;
    let newStatus = parseInt(document.querySelector('#status-selector').firstElementChild.firstElementChild.className);

    // se guarda el usuario por defecto de twitch en una clase vacia al iniciar
    const defUsr = document.querySelector('.tuser-wrapper').children[1].className === 'null' ? null : document.querySelector('.tuser-wrapper').children[1].className;

    // bloquea el boton de editar para evitar sobrecargas
    document.querySelector('#confirm-edit').disabled = true;
    
    // cuanta de errores, si al final resulta mayor a 0 no se envia la edición
    let err = 0;

    // discord no acepta nombres menores a 2 ni mayores a 32 ni con el caracter #, esto sirve para validar si se cumple esta condición
    // suma 1 a la cuenta de errores si la condicion no se cumple
    if(newName && newName.length < 2) {
        document.querySelector('#name-error').innerText = 'El nombre es muy corto...';
        document.querySelector('#name-error').style.display = 'block';
        newName = null;
        err ++;
    }

    if(newName && newName.length > 32) {
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

    // si el nuevo tipo de actividad no es "ninguna" debe haber un nombre de actividad
    if(newActivity !== 6 && !newActivityName) {
        document.querySelector('#activity-error').style.display = 'block';
        err ++;
    }

    // debe haber un usuario de twitch si se quiere poner la actividad "transmitiendo"
    if(newActivity === 1 && !newUser && !defUsr) {
        document.querySelector('#tuser-error').style.display = 'block';
        err ++;
    }

    // si se pone un nuevo usuario, cambiar la clase donde se guarda
    if(newUser) {
        document.querySelector('#default-user').className = `${newUser}`;
    }

    // el estatus se manda en texto en lugar de numero
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

    // si hubo algun error no se manda la solicitud de editar
    if(err > 0) return document.querySelector('#confirm-edit').disabled = false;
    if(document.querySelector('#avatar-error').style.visibility === 'visible') return document.querySelector('#confirm-edit').disabled = false;

    // enviar la solicitud de editar
    renderer.send('editBot', newAvatar, newStatus, newActivity, newActivityName, newName, newUser);
}

// reinicia el bot en caso de errores
function resetClient() {
    // solicitar reinicio
    renderer.send('resetClient');

    // desactiva cualquier actividad para evitar errores
    document.querySelector('#reset-btn').disabled = true;
    document.querySelector('#edit-btn').disabled = true;
    document.querySelector('.guilds').innerHTML = ''

    document.querySelector('.bot-starting').style.display = 'block';
    document.querySelector('.bot-starting').innerText = 'Tu bot está reiniciando...'
    
    document.querySelector('.bot-login').style.display = 'none';

    document.querySelector('#invite-checkbox').disabled = true;
    document.querySelector('#search-input').disabled = true;
}

// buscar servidores por nombre o id
function search(arg) {
    // si la barra de busqueda está vacía, muestra los servidores, si no, muestra solo los resultados de la busqueda
    const disp = arg === '' ? 'block' : 'none';
    
    // bucle que oculta
    for (const child of document.querySelector('.guilds').children) {
        child.style.display = disp;
    }

    // buble que muestra
    for (const child of document.querySelector('.guilds').children) {
        // obtiene la id del servidor y el nombre
        const guildName = child.firstElementChild.lastElementChild.firstElementChild.innerText.toLowerCase();
        const guildId = child.firstElementChild.firstElementChild.id;

        // si la id o el nombre contiene los caracteres de la busqueda, los muestra
        if(guildName.includes(arg.toLowerCase()) || guildId.includes(arg)) {
            child.style.display = 'block';
        }
    }

}

// al activar o desactivar la opcion de crear invitación
function inviteChange(checked) {
    // accede a config.json
    const dir = fs.readFileSync('./config.json');
    const info = new TextDecoder("utf-8").decode(dir);
    const config = JSON.parse(info);

    // cambia el valor de config.json para guardarlo al iniciar de nuevo
    if(checked === true) {
        config.newInv = true;
    } else {
        config.newInv = false;
    }

    // sobreescribe el valor
    fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 4));
}

// dar invitación al servidor
function createInvite(guild) {
    const newInv = document.getElementById('invite-checkbox').checked;

    renderer.send('invite', guild, newInv);
}

// preguntar por confirmación de abandonar servidor
function leaveRequest(guild) {
    // obtener la tarjeta de servidor
    const specifiedElement = document.getElementById(`${guild}`).parentElement.parentElement;

    // mostrar mensaje de confirmación
    specifiedElement.children[0].style.display = 'none';
    specifiedElement.children[1].style.display = 'none';
    specifiedElement.children[2].style.display = 'flex';
    
    // si se hace click fuera del area de confirmacion lo cuenta como elegir "cancelar"
    document.addEventListener("click", function handler(event) {
        const isClickInside = specifiedElement.contains(event.target);

        if (!isClickInside) {
            specifiedElement.children[0].style.display = 'flex';
            specifiedElement.children[1].style.display = 'block';
            specifiedElement.children[2].style.display = 'none';
            
            this.removeEventListener("click", handler);
        }
    });
}

// preguntar por confirmación para crear una invitación
function inviteRequest(guild) {
    // obtener la tarjeta de servidor
    const specifiedElement = document.getElementById(`${guild}`).parentElement.parentElement;

    // mostrar mensaje de confirmación
    specifiedElement.children[0].style.display = 'none';
    specifiedElement.children[1].style.display = 'none';
    specifiedElement.children[3].style.display = 'flex';
    
    // si se hace click fuera del area de confirmacion lo cuenta como elegir "cancelar"
    document.addEventListener("click", function handler(event) {
        const isClickInside = specifiedElement.contains(event.target);

        if (!isClickInside) {
            specifiedElement.children[0].style.display = 'flex';
            specifiedElement.children[1].style.display = 'block';
            specifiedElement.children[3].style.display = 'none';
            
            this.removeEventListener("click", handler);
        }
    });
}

// oculta el area de confirmación
function hideChildren(children, num) {
    children.children[0].style.display = 'flex';
    children.children[1].style.display = 'block';
    children.children[num].style.display = 'none';
}

// abandona el servidor
function leave(guild, btns) {
    // envia la solicitud al bot
    renderer.send('leaveGuild', guild);

    // desactiva los botones del servidor para evitar errores
    const confirmBtns = btns.lastElementChild.lastElementChild.children;
    const guildBtns = btns.children[1].children;

    confirmBtns[0].disabled = true;
    confirmBtns[1].disabled = true;

    guildBtns[0].disabled = true;
    guildBtns[1].disabled = true;
    guildBtns[2].disabled = true;
}

// enviar un mensaje al servidor
function send(guild) {
    console.log(guild);
}

//abrir el explorador de archivos para subir una imagen al area del avatar
//se abre si se da click a subir en la edición sin poner nada
async function openPath() {
    const url = document.getElementById('avatar-input').value === '' ? null : document.getElementById('avatar-input').value;

    if(!url) {
        renderer.send('openFile');
    } else {
        enterLink('avatar-input');
    }
}

// funciones usadas (a grandes razgos)
// document.getElementsByClassName('...')[...].style.display = '...';
// const item = document.querySelector('.');
// item.style.display = 'none';
// item.style.display = 'block';
// item.innertext = var