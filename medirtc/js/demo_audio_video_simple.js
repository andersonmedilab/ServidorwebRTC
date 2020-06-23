var selfEasyrtcid = "";
var otherEasyrtcid = ""
var parametrosUrl;
var conexao = new Object();
var connectList = {};
var channelIsActive = {}; 
var maxCALLERS = 2;
var fileInput = ""
var peers = {};
var arrayFiles = []
var contador = 0;
var statusDownload = 'done';
let link;
let objectURL;
let posicaoNodeListReceive;

function connect() {
    CapturaParametrosUrl();
    var chaveValor = parametrosUrl.toString().split(",");

    conexao[chaveValor[0].substring(0, chaveValor[0].indexOf("="))] = chaveValor[0].substring(chaveValor[0].indexOf("=") + 1);
    conexao[chaveValor[1].substring(0, chaveValor[1].indexOf("="))] = chaveValor[1].substring(chaveValor[1].indexOf("=") + 1);
    conexao[chaveValor[2].substring(0, chaveValor[2].indexOf("="))] = chaveValor[2].substring(chaveValor[2].indexOf("=") + 1);
    conexao[chaveValor[3].substring(0, chaveValor[3].indexOf("="))] = chaveValor[3].substring(chaveValor[3].indexOf("=") + 1);
    conexao[chaveValor[4].substring(0, chaveValor[4].indexOf("="))] = chaveValor[4].substring(chaveValor[4].indexOf("=") + 1);
    if (chaveValor[5]!==undefined){
       conexao[chaveValor[5].substring(0, chaveValor[5].indexOf("="))] = chaveValor[5].substring(chaveValor[5].indexOf("=") + 1);
    }

    conexao.NOMEPACIENTE = conexao.NOMEPACIENTE.replace(/%20/g, " ")
    conexao.NOMEMEDICO = conexao.NOMEMEDICO.replace(/%20/g, " ")

    validadorConexao = conexao.NOMEPACIENTE + conexao.CRM + chaveValor[3]
    conexao.NOMEPACIENTE = conexao.NOMEPACIENTE.split(' ')
    conexao.NOMEPACIENTE = conexao.NOMEPACIENTE[0]

    conexao.NOMEMEDICO = conexao.NOMEMEDICO.split(' ')
    conexao.NOMEMEDICO = conexao.NOMEMEDICO[0]
    console.log(conexao.NOMEPACIENTE)

    //easyrtc.enableDebug(true);
    easyrtc.enableDataChannels(true);
    easyrtc.setDataChannelOpenListener(openListener);
    easyrtc.setDataChannelCloseListener(closeListener);
    easyrtc.setPeerListener(addToConversation);
    easyrtc.setVideoDims(640,480);
    easyrtc.setRoomOccupantListener(callEverybodyElse);
    easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
    easyrtc.setAcceptChecker(function(easyrtcid, responsefn) {
        responsefn(true);
    });

     easyrtc.setUsername(validadorConexao);
}

// Funções dos botões de audio e video
var mutarVideo = false
function muteVideo() {
    updateVideoImage(mutarVideo);   
}

function updateVideoImage(toggle) {
    var ocultaVideo = document.getElementById("ocultaVideo");
        if(!toggle){
            easyrtc.enableCamera(toggle)
            mutarVideo = true
            ocultaVideo.innerHTML = '<i class="fas fa-video-slash"></i>'
        } else {
            easyrtc.enableCamera(toggle)
            mutarVideo = false
            ocultaVideo.innerHTML = '<i class="fas fa-video"></i>'
        }
}

var mutarMeuAudio = false
function muteMeuAudio() {
    updateMicImage(mutarMeuAudio);   
}

function updateMicImage(toggle) {
    var microphone = document.getElementById("microphone");
    if(!toggle){
        easyrtc.enableMicrophone(toggle)
        mutarMeuAudio = true
        microphone.innerHTML = '<i class="fas fa-microphone-alt-slash"></i>'
    } else {
        easyrtc.enableMicrophone(toggle)
        mutarMeuAudio = false
        microphone.innerHTML = '<i class="fas fa-microphone-alt"></i>'
    }
}

function muteOutroAudio() {
    updateFoneImage(true);
}

function updateFoneImage(toggle) {
    var mic = document.getElementById("mic");
    //if( activeBox > 0) { // no kill button for self video
        //muteButton.style.display = "block";
        var videoObject = document.getElementById("callerVideo");
        var isMuted = videoObject.muted?true:false;
        if( toggle) {
            isMuted = !isMuted;
            videoObject.muted = isMuted;
        }
        mic.innerHTML = isMuted?'<i class="fas fa-volume-mute"></i>':'<i class="fas fa-volume-up"></i>';
/*     }
    else {
        muteButton.style.display = "none";
    } */
}
// Fim das funções dos botões de audio e video

// Função que faz a conexão com o outro usuario
function callEverybodyElse(roomName, occupantList, isPrimary) {
    easyrtc.setRoomOccupantListener(null); // so we're only called once.
    connectList = occupantList;

    /* Percorre a lista de easyrtcid das pessoas conectadas e verifica aquela que possui parâmetros vindos da URL identicos aos seus.
    Aqui nós temos acesso ao easyrtcid do host(quem entrou primeiro), pois é através dele que efetuamos a ligação para o mesmo só que 
    na tela do host não temos acesso easyrtcid da pessoa que acaba de ligar pra ele, por isso é necessário descobrir o easyrtc do 
    caller de outra forma atraves da função vincularIdBotao() */
    for(var easyrtcid in occupantList ) {
        if (validadorConexao.toString() === easyrtc.idToName(easyrtcid) ){
            startCall(easyrtcid);
        }
    }

    // Função que chama a função que faz a conexão em si que é a easyrtc.call
    function startCall(otherID) {
        if (easyrtc.getConnectStatus(otherID) === easyrtc.NOT_CONNECTED) {
            console.log(easyrtc.getConnectStatus(otherID))
            console.log(easyrtc.NOT_CONNECTED)
            try {
            easyrtc.call(otherID,
                    function() { // success callback
                        
                            // console.log("made call succesfully");
                            connectList[otherID] = true;
                        
                    },
                    function(errorCode, errorText) {
                        connectList[otherID] = false;
                        noDCs[otherID] = true;
                        //easyrtc.showError(errorCode, errorText);
                    },
                    function(wasAccepted) {
                        // console.log("was accepted=" + wasAccepted);
                    }
            );
            }catch( callerror) {
                console.log("saw call error ", callerror);
            }
        }
        else {
            console.log(easyrtc.getConnectStatus(otherID))
            console.log(easyrtc.NOT_CONNECTED)
            //easyrtc.showError("ALREADY-CONNECTED", "already connected to " + easyrtc.idToName(list[position]));
        }
    }    
}

function CapturaParametrosUrl() {

    //captura a url da página
    var url = window.location.href; 
    
    //tenta localizar o ?
    var res = url.split('?'); 
        
    if (res[1] === undefined) {
        alert('página sem parâmetros.');
    }
    
    if (res[1] !== undefined) {
        //tenta localizar os & (pode haver mais de 1)
        var parametros = res[1].split('&');
        parametrosUrl = parametros;   
    }
}

function openListener(otherParty) {
    channelIsActive[otherParty] = true;
    //updateButtonState(otherParty);
}

function closeListener(otherParty) {
    channelIsActive[otherParty] = false;
    //updateButtonState(otherParty);
}

/* Função chamada ao clicar no botão do chat que faz a primeira verificação do easyrtcid do usuário que está conectado a você.
A segunda verificação para o chat é feita ainda dentro dessa função no botão enviar mensagem e pro file transfer é feita em outro momento. */
function vincularIdBotao() {

    console.log(connectList)
    console.log(easyrtc)
    var easyrtcidCaller; // id do outro usuário

    /* Primeira verificação para capturar o easyrtcid do outro usuário aqui é onde temos a diferença entre o Host e o caller, se o usuário for 
    o caller não existirá clientListDelta nem updateClient então na tela do host dentro de updateClient eu obtenho o easyrctid do outro usuário */
    if (easyrtc.roomData.default.clientListDelta!=undefined){
        for (let easyrtcid in easyrtc.roomData.default.clientListDelta.updateClient){
            console.log(easyrtc.roomData.default.clientListDelta.updateClient)
            easyrtcidCaller = easyrtcid
        }

   }else{
       for (let easyrtcid in connectList){
           easyrtcidCaller = easyrtcid
       }
   }

    console.log(easyrtcidCaller)
    otherEasyrtcid = easyrtcidCaller // Variavel global recebe o id do outro usuário

   // Segunda verificação para capturar o easyrtcid do outro usuário
    /* Caso alguem dê F5 podemos ter alguns problemas quando a obtenção do easyrtcid do outro usuário, por isso é realizada essa verificação
    Indepedente de qual tela dar F5 a pessoa que apertar o botão entrará no fluxo normal do programa e irá obter o easyrtid do outro usuário
    O problema fica na tela de quem não deu F5 que estára com um easyrtcid desatualizado, para isso é feita uma segunda verificação ao clicar
    em enviar a mensagem que verifica se o valor em updateClient continua sendo o mesmo valor que está em easyrtcidCaller */
    let buttonMsg = document.getElementById('enviar_menssagem');
    buttonMsg.onclick = function(easyrtcidCaller) {
        return function() {
            if (easyrtc.roomData.default.clientListDelta!=undefined){
                for (let easyrtcid in easyrtc.roomData.default.clientListDelta.updateClient){
                    console.log(easyrtc.roomData.default.clientListDelta.updateClient)
                    if (easyrtcid!==easyrtcidCaller){
                        easyrtcidCaller = easyrtcid
                    }
                       
                }
            }
            sendStuffP2P(easyrtcidCaller); //envia a mensagem pro outro usuário
        };
    }(easyrtcidCaller);

    let inputEnviarMsg = document.querySelector('#menssagem')
    inputEnviarMsg.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
            if (easyrtc.roomData.default.clientListDelta!=undefined){
                for (let easyrtcid in easyrtc.roomData.default.clientListDelta.updateClient){
                    console.log(easyrtc.roomData.default.clientListDelta.updateClient)
                    if (easyrtcid!==easyrtcidCaller){
                        easyrtcidCaller = easyrtcid 
                    }  
                }
            }
            sendStuffP2P(easyrtcidCaller); //envia a mensagem pro outro usuário
            }
        });
}

function pegarDataAtual(){
    var dataAtual = new Date();
    // var dia = (dataAtual.getDate()<10 ? '0' : '') + dataAtual.getDate();
    // var mes = ((dataAtual.getMonth() + 1)<10 ? '0' : '') + (dataAtual.getMonth() + 1);
    // var ano = dataAtual.getFullYear();
    var hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
    var minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();
    // var segundo = (dataAtual.getSeconds()<10 ? '0' : '') + dataAtual.getSeconds();

    var dataFormatada = " " + hora + ":" + minuto;
    return dataFormatada;
}

// Funções para o funcionamento do chat

// Função que adiciona a caixa de texto do chat a mensagem que foi enviada
function addToConversation(who, msgType, content) {
    // Escape html special characters, then add linefeeds.
    let username = ""
    content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    content = content.replace(/\n/g, '<br />');
    if (who!='Eu'){
        who = 'Ele'
    }
    // console.log(conexao.P)

    if (who === 'Eu') {
        if (conexao.P === undefined) {
            username = conexao.NOMEMEDICO
        } else {
            username = conexao.NOMEPACIENTE
        }
    } else {
        if (conexao.P === undefined) {
            username = conexao.NOMEPACIENTE
        } else {
            username = conexao.NOMEMEDICO
        }
    }

    var divCaixaMsg = document.getElementById('conversation')
    var divMsgEnviada = document.createElement("div")
    divMsgEnviada.className = "textoBox"
    divCaixaMsg.appendChild(divMsgEnviada)
    divMsgEnviada.innerHTML +=
        "<b>" + username + "<span class = 'horaChat'>" + pegarDataAtual() +":"+"</span>" + "</b>" +"<br>"+ content;
    divMsgEnviada.id = who
    if (divMsgEnviada.id === 'Eu'){
        divMsgEnviada.style.backgroundColor = "#2066a2"
        divMsgEnviada.querySelector('b').style.color = "#e7e7e7"
        divMsgEnviada.querySelector('span').style.color = "#392626"
        // teste2.style.textAlign = "right"
        // teste2.querySelector('.textMsg').style.textAlign = "right"
        // "<p class='textMsg'>"+
    } else {
        divMsgEnviada.style.backgroundColor = "#e7e7e7"
        divMsgEnviada.style.color ="#000"
    }
}

// Função que é passada pra dentro da biblioteca do easyRTC e lá dentro ocorrem os procedimentos pra enviar a mensagem em si
function sendStuffP2P(otherEasyrtcid) {
    var text = document.getElementById('menssagem').value;
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }
    if (easyrtc.getConnectStatus(otherEasyrtcid) === easyrtc.IS_CONNECTED) {
        // Repare que é aqui onde a mensagem é realmente enviada pra biblioteca, pois temos easyrtc.
        easyrtc.sendDataP2P(otherEasyrtcid, 'msg', text);
    }
    else {
        easyrtc.showError("NOT-CONNECTED", "not connected to " + easyrtc.idToName(otherEasyrtcid) + " yet.");
    }
    /* Quando a função addToConversation é chamada aqui no front-end significa que a pessoa que está enviando a mensagem é você mesmo
    Já quando essa função é chamada pelo callback da biblioteca significa que é a sua mensagem chegando na tela do outro usuário, por isso
    por aqui é ME e quando chamada de dentro da biblioteca ela vem com o easyrtcid de quem enviou para aparecer na tela do outro usuário
    com seu nome */
    addToConversation("Eu", "msgtype", text);
    document.getElementById('menssagem').value = "";
}

// Fim das funções para o funcionamento do chat

function vincularIdBotaoArq () {
    // peers[easyrtcidCaller] = true;
    console.log("teste")
}

// Funções para o funcionamento da trasnferência de arquivos

function removeIfPresent(parent, childname) {
    var item = document.getElementById(childname);
    if (item) {
        parent.removeChild(item);
    }
    else {
        console.log("didn't see item " + childname + " for delete eh");
    }
}

/* Função que cria a div na tela da pessoa que está recebendo o arquivo, também é passada como parametro pra biblioteca e é lá onde ela é 
realmente construida, se eu setar a função wasAccepted como true ai efetuo o download do arquivo */
function acceptRejectCB(otherGuy, fileNameList, wasAccepted) {
    console.log(fileNameList)
    var conversation = document.getElementById('conversation');
    let divRecebeArquivo = document.createElement("div");
    let username;
    divRecebeArquivo.id = "receivearea"
    divRecebeArquivo.className = "receiveBlock";

    console.log('entrei no recebimento de arquvo 1')

/*     var peerBlock = document.createElement("div");
    peerBlock.id = buildPeerBlockName(otherEasyrtcid);
    peerBlock.className = "peerblock";
    peerBlock.appendChild(buildReceiveDiv2(otherEasyrtcid)); */
    conversation.appendChild(divRecebeArquivo);
    console.log(conversation)
    peers[otherEasyrtcid] = true;
    
    console.log(document.getElementById('conversation').querySelectorAll('div'))
    var nodeListDivReceive = document.getElementById('conversation').querySelectorAll('div')

    var receiveBlock = nodeListDivReceive[nodeListDivReceive.length - 1];
    // jQuery(receiveBlock).empty();
    receiveBlock.style.display = "inline-block";

    //
    // list the files being offered
    //

    if (conexao.P === undefined) {
        username = conexao.NOMEPACIENTE
    } else {
        username = conexao.NOMEMEDICO
    }

    for (var i = 0; i < fileNameList.length; i++) {
        receiveBlock.innerHTML = "<b>"+username+"</b>" + "<span class = 'horaChat'>" + pegarDataAtual() +":"+"</span>" +"<br>" + fileNameList[i].name + "(" + fileNameList[i].size + " bytes)"
    }

    //
    // provide accept/reject buttons
    //

    let carregando = document.createElement("img")
    carregando.id = "imagemDownload"
    carregando.src = "loading.fef1f20.gif"
    carregando.width = 23
    carregando.height = 22
    carregando.style.marginLeft = "3px"
    carregando.style.display = "none"
    

    var button1 = document.createElement("button");
    button1.className = "botaoDownload"
    button1.innerHTML = '<i class="fas fa-download"></i>'
    button1.style.color = "#2066a2"
    button1.onclick = function() {
        console.log('entrei no botão do accept')
        // jQuery(receiveBlock).empty();
        if (statusDownload === 'done') {
            wasAccepted(true);
            carregando.style.display = "inline-block"
            posicaoNodeListReceive = nodeListDivReceive.length - 1
        } 
    };
    receiveBlock.appendChild(button1);
    receiveBlock.appendChild(carregando)

/*     var button2 = document.createElement("button");
    button2.className = "botaoReject"
    button2.appendChild(document.createTextNode("Reject"));
    button2.onclick = function() {
        console.log('entrei no botão do reject')
        wasAccepted(false);
        receiveBlock.style.display = "none";
    };
    receiveBlock.appendChild(button2); */
    console.log('teste')
}

/* Essa função também é passada pra biblioteca como parametro e ela é acionada após a pessoa apertar o botão de download(wasAccepted como true)
através dela eu posso acompanhar o status do download do arquivo */
function receiveStatusCB(otherGuy, msg) {
    console.log('entrei no recebimento de arquvo 2')
    var receiveBlock = document.getElementById('receivearea');
    var carregandoDownload = document.querySelectorAll('#imagemDownload')
    statusDownload = msg.status;
    if (statusDownload === 'done') {
        carregandoDownload[posicaoNodeListReceive].style.display = 'none'
    if( !receiveBlock) return;
    console.log('testando a passada')
    console.log(msg.status)
    
}
/*     switch (msg.status) {
        case "started":
            break;
        case "eof":
            receiveBlock.innerHTML = "Finished file";
            break;
        case "done":
            receiveBlock.innerHTML = "Stopped because " +msg.reason;
            setTimeout(function() {
                // receiveBlock.style.display = "none";
            }, 1000);
            break;
        case "started_file":
            receiveBlock.innerHTML = "Beginning receive of " + msg.name;
            break;
        case "progress":
            receiveBlock.innerHTML = msg.name + " " + msg.received + "/" + msg.size;
            break;
        default:
            console.log("strange file receive cb message = ", JSON.stringify(msg));
    } */
    return true;
}

function blobAcceptor(otherGuy, blob, filename) {
    easyrtc_ft.saveAs(blob, filename);
    console.log('testando onde é chamada')
}

/* Função que interage com a a tela da pessoa que está enviando o arquivo, inicialmente ela exibia determinadas mensagens dependendo do status
do download do outro usuário, mas foi alterada pra construir a div de envio de arquivo */
function updateStatusDiv(state, verificador) {
    console.log('vendo onde é chamada essa funçao')

    console.log(state)
     switch (state.status) {
        case "waiting":

            console.log(arrayFiles)
            var conversation = document.getElementById('conversation');
            var emissor = document.createElement("div")
            let username;
            emissor.className = "fileSender"
            conversation.appendChild(emissor)
            console.log(fileInput.files)
            console.log(fileInput.files[0].name)
            console.log(fileInput.files[0].size)
            var mandarAceito = [{
                name:fileInput.files[0].name,
                size:fileInput.files[0].size
            }]
            console.log(mandarAceito)
            // list the files being offered

            if (conexao.P === undefined) {
                username = conexao.NOMEMEDICO
            } else {
                username = conexao.NOMEPACIENTE
            }
            console.log(username)
            
            for (var i = 0; i < mandarAceito.length; i++) {
    
                    emissor.innerHTML = "<b>"+username+"</b>" + "<span class = 'horaChat'>" + pegarDataAtual() +":"+"</span>" +"<br>" + mandarAceito[i].name + "(" + mandarAceito[i].size + " bytes)"
            }
            //
            // provide accept/reject buttons
            //

            console.log(verificador)
            if (verificador!== undefined) {
                console.log('teste')
                emissor.innerHTML = "<b>"+username+"</b>" + "<span class = 'horaChat'>" + pegarDataAtual() +":"+"</span>" +"<br>" + "Download acima de 200mb não permitido"
            } else {
                var button = document.createElement("button");
                button.className = "botaoDownload"
                button.innerHTML = '<i class="fas fa-download"></i>'
                const posicaoDownloadSender = contador;
                button.onclick = function() {
                    const file = arrayFiles[posicaoDownloadSender][0]
                    objectURL = URL.createObjectURL(file);
                    link.download = arrayFiles[posicaoDownloadSender][0].name
                    link.href = objectURL;
    
                    console.log(posicaoDownloadSender) 
                    console.log('entrei no botão do accept')
                    link.click();
                    // wasAccepted(true);
                };
                emissor.appendChild(button);
            }  
            emissor.querySelector('b').style.color = "#fff"
            emissor.querySelector('span').style.color = "#392626"          
            break;
/*         case "started_file":
            statusDiv.innerHTML = "started file: " + state.name;
            break;
        case "working":
            statusDiv.innerHTML = state.name + ":" + state.position + "/" + state.size + "(" + state.numFiles + " files)";
            break;
        case "rejected":
            statusDiv.innerHTML = "cancelled";
            setTimeout(function() {
                statusDiv.innerHTML = "";
            }, 2000);
            break;
        case "done":
            statusDiv.innerHTML = "done";
            setTimeout(function() {
                statusDiv.innerHTML = "";
            }, 3000);
            break; */
    } 
    return true;
}

var noDCs = {}; // which users don't support data channels

var fileSender = null;
function filesHandler(files) {
    console.log('onde chama 1')
    if (easyrtc.roomData.default.clientListDelta!=undefined){
        for (let easyrtcid in easyrtc.roomData.default.clientListDelta.updateClient){
            console.log(easyrtc.roomData.default.clientListDelta.updateClient)
            if (easyrtcid!==otherEasyrtcid){
                console.log('teste')
                otherEasyrtcid = easyrtcid
                fileSender = easyrtc_ft.buildFileSender(otherEasyrtcid, updateStatusDiv);
            }
               
        }
    }
    // if we haven't eastablished a connection to the other party yet, do so now,
    // and on completion, send the files. Otherwise send the files now.
    var timer = null;
    if (easyrtc.getConnectStatus(otherEasyrtcid) === easyrtc.NOT_CONNECTED && noDCs[selfEasyrtcid] === undefined) {
        //
        // calls between firefrox and chrome ( version 30) have problems one way if you
        // use data channels.
        //

    }
    else if (easyrtc.getConnectStatus(otherEasyrtcid) === easyrtc.IS_CONNECTED || noDCs[selfEasyrtcid]) {
        console.log('onde chama 2')

        if (!fileSender) {
            console.log('onde chama 3')
            fileSender = easyrtc_ft.buildFileSender(otherEasyrtcid, updateStatusDiv);
        }
        console.log('onde chama 2')
        console.log(files)
        if (files.length > 0) {
            fileSender(files, true /* assume binary */);
        }  
    }
    else {
        easyrtc.showError("user-error", "Wait for the connection to complete before adding more files!");
    }
}
// Fim das funções para o funcionamento da trasnferência de arquivos

// Converte a data vinda pela URL em um objeto Date para efetuarmos as manipulações necessárias
function converteData(data){
    var temporario = data.split("DATA=")
    temporario[1] = new Date(parseInt(temporario[1]))
    return temporario[1]
}

// Funções de loginSuccess e loginFailure que são chamadas assim que a pessoa loga, sendo chamada loginSucess se der certo e failure se der errado

// Aqui nos executamos alguns restrições de tempo(30 min), quantidade de conexões (2) e verificação se o Status(equip_agenda) está correto
function loginSuccess(easyrtcid) {

    link = document.getElementById('link');
    console.log(easyrtc)
    connectList = easyrtc.roomData.default.clientList
    selfEasyrtcid = easyrtcid;
    // Tratamento do envio e recebimento de arquivo
    fileInput = document.getElementById("enviar_arquivo");
    var dropArea = document.createElement("div");
    easyrtc_ft.buildDragNDropRegion(dropArea, filesHandler);
    fileInput.addEventListener('change', function () {
        let limitadorDownload = this.files[0].size/(1024*1024)
        console.log(this.files[0].size)
        console.log(this.files[0].size/(1024*1024))

        if (limitadorDownload <= 200) {
            arrayFiles[contador] = [this.files[0]]
            filesHandler(fileInput.files);
            contador+=1
            console.log(contador)

        } else {
            updateStatusDiv({seq:1,status:"waiting"}, true)
            alert('Tamanho de download maior que 200mb')
        }
        
      
    });
    easyrtc_ft.buildFileReceiver(acceptRejectCB, blobAcceptor, receiveStatusCB);
    // Fim do tratamento do envio e recebimento de arquivo
    
    console.log(selfEasyrtcid)
    var logar = true;
    var cont = 0
    for(var tagConnection in easyrtc.roomData.default.clientList){
        if (validadorConexao.toString() === easyrtc.idToName(tagConnection)){
            //easyrtc.setRoomOccupantListener(vincularIdBotao);
            cont+=1 
        }
        let now = new Date()
        let horaEntrada = new Date(now.valueOf() - now.getTimezoneOffset() * 60000)
        var horaLimite = converteData(easyrtc.idToName(tagConnection))
        //var intervalo = Date.parse(horaFinal) - Date.parse(horaInicial)
        if (Date.parse(horaEntrada) <= Date.parse(horaLimite)  && horaEntrada.toDateString(horaEntrada) === horaLimite.toDateString(horaLimite)){
            logar = true
        }else{
            logar = false
        }
    }

    if(cont > 2 ){
        easyrtc.disconnect();
        window.location.href = "erro.html";
    }
    if(logar === false ){
        easyrtc.disconnect();
        window.location.href = "erro.html";
    }

    if(conexao.STATUS != "OK"){
        if (conexao.STATUS === "Conf"){

        } else {
            easyrtc.disconnect();
            window.location.href = "erro.html";
        }
    }
}

// Aqui adaptamos a função loginFailure para caso a pessoa não tenha camera possa se conectar apenas com audio
function loginFailure(errorCode, message) {

    if(message.toString() === "Failed to get access to local media. Error code was NotFoundError."){
        alert("Você está sem transmitir vídeo, ou você não possui um dispositivo de vídeo ou alguma configuração do seu navegador não permite utilizar o mesmo")
        easyrtc.enableVideo(false)
        easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
    }

    if(message.toString() !== "Failed to get access to local media. Error code was NotFoundError."){
        easyrtc.showError(errorCode, message);
    }  
}

function sair(){
    //window.location.href = "salaEspera.html";
    if(conexao.STATUS == "OK"){
        window.location.href = "http://localhost:8080/mediagenda_web/salaEspera.html";
    }else if(conexao.STATUS == "Conf"){
        window.location.href = "sair.html";
    } 
}