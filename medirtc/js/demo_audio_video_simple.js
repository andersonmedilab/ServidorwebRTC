var selfEasyrtcid = "";
let outroID; // easyrtcid do outro usuário só que é obtido em dois momentos: durante a call em callEverybodyElse a ou no setAcceptChecker pro host
var conexao = {}; // parametros da url no formato de objeto
var chaveValor; // parametros da url em array
var channelIsActive = {};
var fileInput = ""; // recebe o arquivo que foi enviado
var arrayFiles = []; // array dos arquivos enviados
var contador = 0; // contador que adiciona o arquivo na proxima posição do array
var statusDownload = 'done'; // só permite que efetue um download caso o status seja done (só permite baixar um arquivo por vez)
var posicaoNodeListReceive; // verifica a posição na lista de divs do receiveBlock
let streamVigente = null; // stream do selfVideo
let streamCaller = null; // stream do callerVideo
let objetoVideo; // objeto que contem os devices capturados do usuário
var fileSender = null; // variavel que constroi a função de enviar arquivos(vinculada ao easyrtid do outro usuario)
let somaMsgRcebida = 0;
let imHost = false

function scrollBottom(){
    let objDiv = document.getElementById("conversation");
    objDiv.scrollTop = objDiv.scrollHeight;
}

// Inicio das funções para construção do video e troca de camera 
easyrtc.setStreamAcceptor(function (easyrtcid, stream, streamName) {
    console.log('verificando onde a fncao que capta a outra stream é chamada')
    console.log(easyrtcid)
    console.log('stream do caller')
    console.log(stream)
    streamCaller = stream

    var mic = document.getElementById("mic");
    mic.innerHTML = '<i class="fas fa-volume-up"></i>';

    
    var item = document.getElementById("callerVideo");
    item.style.display = 'block'

    if (streamName === 'default') {
        easyrtc.setVideoObjectSrc(item,stream);


    } else {
        addMediaStreamToDiv("callerVideo", stream, streamName, false);
    }



    //labelBlock.parentNode.id = "callerVideo"

});

easyrtc.setOnStreamClosed(function (easyrtcid, stream, streamName) {
    console.log('verificando quando o close stream ta sendo chamado')
    // let verificaStreamFechada = easyrtc.getRemoteStream(outroID,streamCaller.streamName) // se for diferente de null a stream não foi fechada corretamente
    // var item = document.getElementById("callerVideo");

    // console.log(verificaStreamFechada)


    /*      if (easyrtc.roomData.default.clientListDelta.removeClient!== undefined) {
            location.reload();
        }  */


    console.log(stream)
    /*     var item = document.getElementById("callerVideo");
        easyrtc.setVideoObjectSrc(item, stream)
        easyrtc.clearMediaStream(item)  */

    // item.style.display = 'none'
    // item.parentNode.removeChild(item);
});

easyrtc.setCallCancelled(function (easyrtcid) {
    console.log('setCallCancelled - verificando em qual momento essa função é chamada')
    fileSender = null;
});

function addMediaStreamToDiv(divId, stream, streamName, isLocal, divVideo) {

    console.log('vendo onde entra 4')
    console.log(stream)
    /*     var container = document.createElement("div");
        container.style.marginBottom = "10px";
        var formattedName = streamName.replace("(", "<br>").replace(")", ""); */


    var teste = document.getElementById("testeScreen");
    var labelBlock = document.createElement("div");

    labelBlock.style.width = "220px";
    labelBlock.style.cssFloat = "left";
    // labelBlock.innerHTML = "<pre>" + formattedName + "</pre><br>";
    teste.appendChild(labelBlock);
    var video = document.getElementById(divId);
    video.muted = isLocal;
    video.autoplay = true;

    easyrtc.setVideoObjectSrc(video, stream);

    let erroResolution = document.querySelector('#easyrtcErrorDialog')
    if(erroResolution!==null) {
        erroResolution = erroResolution.querySelector('.easyrtcErrorDialog_element')
        if (erroResolution!==null) {
            if(erroResolution.innerHTML.includes("Requested video size of")) {
                console.log('verificando se cai aqui ')
                console.log(document.querySelector('#easyrtcErrorDialog'))
                document.querySelector('#easyrtcErrorDialog').style.display = 'none'
            }
            console.log(erroResolution)
        }
    }
    return labelBlock;
}

// botão de fechar a stream
function createLocalVideo(stream, streamName) {
    console.log('vendo onde entra 3')
    console.log(stream)
    console.log(streamName)
    console.log('oi')
    var labelBlock = addMediaStreamToDiv("selfVideo", stream, streamName, true);

}

var localStreamCount = 0;

// adiciona os botões de stream
function addSrcButton(buttonLabel, videoId) {
    console.log(videoId)
    var button = createLabelledButton(buttonLabel);


    var streamName1 = buttonLabel + "_" + localStreamCount;
    console.log(streamName1)


    button.onclick = function () {
        var streamName = buttonLabel + "_" + localStreamCount;
        localStreamCount++;
        console.log(streamName)

        // solução futura pra testar o fechamento da stream vigente assim q abrir uma nova

        if (streamVigente !== null) {
            easyrtc.closeLocalStream(streamVigente.streamName);
        }

        mutarVideo = false
        var ocultaVideo = document.getElementById("ocultaVideo");
        ocultaVideo.innerHTML = '<i class="fas fa-video"></i>'

        mutarMeuAudio = false
        var microphone = document.getElementById("microphone");
        microphone.innerHTML = '<i class="fas fa-microphone-alt"></i>'

        console.log(ocultaVideo)

        easyrtc.setVideoSource(videoId);
        easyrtc.initMediaSource(
            function (stream) {

                streamVigente = stream
                console.log('vendo onde entra 2')
                createLocalVideo(stream, streamName);
                console.log(stream)
                if (outroID) {
                    console.log('vendo onde entra 1')
                    easyrtc.addStreamToCall(outroID, streamName);
                }
            },
            function (errCode, errText) {
                easyrtc.showError(errCode, errText);
            }, streamName);
    };
}

// cria diversos botões inclusive o que eu preciso que é pra escolha do video
function createLabelledButton(buttonLabel) {
    var button = document.createElement("button");
    button.appendChild(document.createTextNode(buttonLabel));
    document.getElementById("testeScreen").appendChild(button);
    // button.appendChild(document.createElement("hr")); // rodrigo
    return button;
}

// Fim das funções para construção do video e troca de camera 

//Função acionada quando o outro usuário sai da sessão(Seja um F5 ou sair realmente)
easyrtc.setPeerClosedListener(function (easyrtcid) {
    console.log('entra plz')
    console.log(easyrtcid)
    fileSender = null;

    setTimeout(function (){
        let anyError = document.querySelector('#easyrtcErrorDialog')
        if(anyError!==null) {
            document.querySelector('#easyrtcErrorDialog').style.display = 'none'
        }
    },2000)
})

// Função acionada na tela do host(quem entrou primeiro) toda vez que outro usuário faz uma call pra ele
easyrtc.setAcceptChecker(function (easyrtcid, callback) {
    console.log('vendo onde entra a função que é chamada na tela do vegetal quando o animal entra')
    console.log(easyrtcid)
    outroID = easyrtcid;
    imHost = true;

    let stop = setInterval(function() {
        console.log('verificando o timeout de chegar na stream do caller antes da minha')
        if (streamVigente !== null && streamCaller !== null) {
                console.log('vendo em que momento vai adicionar a stream a call')
                easyrtc.addStreamToCall(easyrtcid, streamVigente.streamName);
            
            clearInterval(stop)
        }
    },3000)
/*     if (streamVigente === null) {
        console.log('onde entra na construção da stream')
        easyrtc.setVideoSource(objetoVideo[0].deviceId);
        console.log('verificando se quando o bug ocorre cai no if')
        console.log(objetoVideo[0].deviceId)
        easyrtc.initMediaSource(
            function (stream) {
                console.log(stream)
                console.log('verificando se quando o bug ocorre ele entra na criação do video')
                streamVigente = stream
                createLocalVideo(stream, 'padrao');
                easyrtc.addStreamToCall(outroID, 'padrao');

            },
            function (errCode, errText) {
                easyrtc.showError(errCode, errText);
            }, 'padrao')

            // Caso algum problema ocorra em 5s e eu não obtenha stream do outro usuário eu fecho e abro novamente a minha
            setTimeout(function(){
                let anotherStreamWasReceived = easyrtc.getRemoteStream(outroID)
                if (anotherStreamWasReceived === null) {
                    easyrtc.closeLocalStream(streamVigente.streamName)
                    easyrtc.setVideoSource(objetoVideo[0].deviceId);
                    easyrtc.initMediaSource(
                        function(stream) {
                            console.log(stream)
                            console.log('verificando se quando o bug ocorre ele entra na criação do video')
                            streamVigente = stream
                            createLocalVideo(stream, 'padrao');
            
                            easyrtc.addStreamToCall(outroID, 'padrao');
                            
                        },
                        function(errCode, errText) {
                            easyrtc.showError(errCode, errText);
                        }, 'padrao')  
        
                }
            },5000)
    } */
    console.log('vendo como essa linha vai se comportar antes do callback')
    if (easyrtc.getConnectionCount() > 0) {
        console.log('vendo em que momento ele cai nesse if')
        easyrtc.hangupAll();
    }
    callback(true, easyrtc.getLocalMediaIds());
    console.log('vendo como essa linha vai se comportar depois do callback')
});

function processUrlParameters(parametrosUrl) {
    chaveValor = parametrosUrl.toString().split(",");

    // Tratativa dos parametros vindos da URL
    conexao[chaveValor[0].substring(0, chaveValor[0].indexOf("="))] = chaveValor[0].substring(chaveValor[0].indexOf("=") + 1);
    conexao[chaveValor[1].substring(0, chaveValor[1].indexOf("="))] = chaveValor[1].substring(chaveValor[1].indexOf("=") + 1);
    conexao[chaveValor[2].substring(0, chaveValor[2].indexOf("="))] = chaveValor[2].substring(chaveValor[2].indexOf("=") + 1);
    conexao[chaveValor[3].substring(0, chaveValor[3].indexOf("="))] = chaveValor[3].substring(chaveValor[3].indexOf("=") + 1);
    conexao[chaveValor[4].substring(0, chaveValor[4].indexOf("="))] = chaveValor[4].substring(chaveValor[4].indexOf("=") + 1);
    console.log(chaveValor[5])

    if (chaveValor[5] !== undefined) {
        if (chaveValor[5] !== 'P=A') {
            conexao[chaveValor[5].substring(0, chaveValor[5].indexOf("="))] = chaveValor[5].substring(chaveValor[5].indexOf("=") + 1);
            var decoded = atob(conexao.URL)
            decoded = decoded.split('/salaEspera')
            conexao.URL = decoded[0]
        } else {
            conexao[chaveValor[5].substring(0, chaveValor[5].indexOf("="))] = chaveValor[5].substring(chaveValor[5].indexOf("=") + 1);
        }
    }

    if (chaveValor[6] !== undefined) {
        conexao[chaveValor[6].substring(0, chaveValor[6].indexOf("="))] = chaveValor[6].substring(chaveValor[6].indexOf("=") + 1);
    }

    console.log(conexao)

    if (!conexao.NOMEMEDICO) {
        conexao.NOMEMEDICO = 'Atendente'
    }

    conexao.NOMEPACIENTE = conexao.NOMEPACIENTE.replace(/%20/g, " ")
    conexao.NOMEMEDICO = conexao.NOMEMEDICO.replace(/%20/g, " ")

    validadorConexao = conexao.NOMEPACIENTE + conexao.CRM + chaveValor[3]
    conexao.NOMEPACIENTE = conexao.NOMEPACIENTE.split(' ')
    conexao.NOMEPACIENTE = conexao.NOMEPACIENTE[0]

    conexao.NOMEMEDICO = conexao.NOMEMEDICO.split(' ')
    conexao.NOMEMEDICO = conexao.NOMEMEDICO[0]
    console.log(conexao.NOMEPACIENTE)
    console.log(conexao)

}


function connect() {

    let parametrosUrl = CapturaParametrosUrl();
    processUrlParameters(parametrosUrl)
    detectBrowser();

    //easyrtc.enableDebug(true);
    easyrtc.enableDataChannels(true);
    easyrtc.setDataChannelOpenListener(openListener);
    easyrtc.setDataChannelCloseListener(closeListener);
    easyrtc.setPeerListener(addToConversation);
    easyrtc.setVideoDims(640, 480);
    // easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
    // easyrtc.connect("easyrtc.audioVideoSimple", loginSuccess, loginFailure);
    easyrtc.setRoomOccupantListener(callEverybodyElse);
    easyrtc.setAutoInitUserMedia(false);

    easyrtc.getVideoSourceList(function (videoSrcList) {
        objetoVideo = videoSrcList
        console.log(objetoVideo)
        for (var i = 0; i < videoSrcList.length; i++) {
            var videoEle = videoSrcList[i];
            var videoLabel = (videoSrcList[i].label && videoSrcList[i].label.length > 0) ?
                (videoSrcList[i].label) : ("src_" + i);
            addSrcButton(videoLabel, videoSrcList[i].deviceId);
        }

        if (objetoVideo.length === 0) {
            console.log('vendo')
            easyrtc.enableVideo(false)

            easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);

            streamVigente = easyrtc.getLocalStream()
            console.log(streamVigente)
            setTimeout(function (){
                let anyError = document.querySelector('#easyrtcErrorDialog')
                if(anyError!==null) {
                    document.querySelector('#easyrtcErrorDialog').style.display = 'none'
                }
            },2000)
            easyrtc.setPeerClosedListener(function (easyrtcid) {
                console.log('entra plz')
                console.log(easyrtcid)
                fileSender = null;
            
            })
            easyrtc.setAcceptChecker(function (easyrtcid, callback) {
                console.log('teste')
                outroID = easyrtcid
                callback(true, easyrtc.getLocalMediaIds());
            })
            // easyrtc.connect("easyrtc.audioVideoSimple", loginSuccess, loginFailure);
        } else {

            easyrtc.initMediaSource(
                function (stream) {
        
                    streamVigente = stream
                    console.log(stream)
                    console.log('vendo onde entra 2')
        
                    var selfVideo = document.getElementById("selfVideo");
                    easyrtc.setVideoObjectSrc(selfVideo, stream);
        
                    let erroResolution = document.querySelector('#easyrtcErrorDialog')
                    if(erroResolution!==null) {
                        erroResolution = erroResolution.querySelector('.easyrtcErrorDialog_element')
                        if (erroResolution!==null) {
                            if(erroResolution.innerHTML.includes("Requested video size of")) {
                                console.log('verificando se cai aqui ')
                                console.log(document.querySelector('#easyrtcErrorDialog'))
                                document.querySelector('#easyrtcErrorDialog').style.display = 'none'
                            }
                            console.log(erroResolution)
                        }
                    }
                    easyrtc.connect("easyrtc.audioVideoSimple", loginSuccess, loginFailure);
        
                    if (outroID) {
                        console.log('vendo em qual das telas entra')
                        console.log('vendo onde entra 1')
                        // easyrtc.addStreamToCall(outroID, streamVigente.streamName);
                    }
                },
                function (errCode, errText) {
                    easyrtc.showError(errCode, errText);
                });

        }
    });
    easyrtc.setUsername(validadorConexao);

}

// Funções dos botões de audio e video
var mutarVideo = false
function muteVideo() {
    console.log(easyrtc.getLocalStream())
    console.log(streamVigente)
    // easyrtc.closeLocalStream(streamVigente.streamName);
    updateVideoImage(mutarVideo);
}

function updateVideoImage(toggle) {
    var ocultaVideo = document.getElementById("ocultaVideo");
    if (!toggle) {
        easyrtc.enableCamera(toggle, streamVigente.streamName)
        mutarVideo = true
        ocultaVideo.innerHTML = '<i class="fas fa-video-slash"></i>'
    } else {
        easyrtc.enableCamera(toggle, streamVigente.streamName)
        mutarVideo = false
        ocultaVideo.innerHTML = '<i class="fas fa-video"></i>'
    }
}

var mutarMeuAudio = false
function muteMeuAudio() {
    console.log(easyrtc.getLocalStream())

    updateMicImage(mutarMeuAudio);
}

function updateMicImage(toggle) {
    var microphone = document.getElementById("microphone");
    if (!toggle) {
        easyrtc.enableMicrophone(toggle, streamVigente.streamName)
        mutarMeuAudio = true
        microphone.innerHTML = '<i class="fas fa-microphone-alt-slash"></i>'
    } else {
        easyrtc.enableMicrophone(toggle, streamVigente.streamName)
        mutarMeuAudio = false
        microphone.innerHTML = '<i class="fas fa-microphone-alt"></i>'
    }
}

function muteOutroAudio() {
    console.log(easyrtc.getRemoteStream(outroID))
    // easyrtc.setVideoObjectSrc(document.getElementById('callerVideo'),easyrtc.getRemoteStream(outroID))
    updateFoneImage(true);
}

function updateFoneImage(toggle) {
    var mic = document.getElementById("mic");
    //if( activeBox > 0) { // no kill button for self video
    //muteButton.style.display = "block";
    var videoObject = document.getElementById("callerVideo");
    var isMuted = videoObject.muted ? true : false;
    if (toggle) {
        isMuted = !isMuted;
        videoObject.muted = isMuted;
    }
    mic.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    /*     }
        else {
            muteButton.style.display = "none";
        } */
}
// Fim das funções dos botões de audio e video

// Função que faz a conexão com o outro usuario
function callEverybodyElse(roomName, occupantList, isPrimary) {
    easyrtc.setRoomOccupantListener(null); // so we're only called once.
    console.log('verificando se sou acionado aqui sendo host 1')

    /* Percorre a lista de easyrtcid das pessoas conectadas e verifica aquela que possui parâmetros vindos da URL identicos aos seus.
    Aqui nós temos acesso ao easyrtcid do host(quem entrou primeiro), pois é através dele que efetuamos a ligação para o mesmo só que 
    na tela do host não temos acesso easyrtcid da pessoa que acaba de ligar pra ele, por isso é necessário descobrir o easyrtc do 
    caller de outra forma atraves da função vincularIdBotao() */
    for (var easyrtcid in occupantList) {
        if (validadorConexao.toString() === easyrtc.idToName(easyrtcid)) {
            outroID = easyrtcid
            startCall(easyrtcid);
        }
    }

    // Função que chama a função que faz a conexão em si que é a easyrtc.call
    // var keys = easyrtc.getLocalMediaIds();
    function startCall(otherID) {
        var keys = easyrtc.getLocalMediaIds();
        console.log(keys)
        if (easyrtc.getConnectStatus(otherID) === easyrtc.NOT_CONNECTED) {
            console.log(easyrtc.getConnectStatus(otherID))
            console.log(easyrtc.NOT_CONNECTED)
            try {
                easyrtc.call(otherID,
                    function () { // success callback

                        // console.log("made call succesfully");

                    },
                    function (errorCode, errorText) {
                        noDCs[otherID] = true;
                        //easyrtc.showError(errorCode, errorText);
                    },
                    function (wasAccepted) {
                        // console.log("was accepted=" + wasAccepted);
                    }, keys);
            } catch (callerror) {
                console.log("saw call error ", callerror);
            }
        } else {
            console.log(easyrtc.getConnectStatus(otherID))
            console.log(easyrtc.NOT_CONNECTED)
            //easyrtc.showError("ALREADY-CONNECTED", "already connected to " + easyrtc.idToName(list[position]));
        }

        easyrtc.addStreamToCall(otherID, streamVigente.streamName);

/*         if (streamVigente === null) {
            console.log('verificando se sou acionado aqui sendo host 2')
            if (objetoVideo[0] !== undefined) {
                easyrtc.setVideoSource(objetoVideo[0].deviceId);
            }
            easyrtc.initMediaSource(
                function (stream) {
                    console.log(stream)
                    streamVigente = stream
                    createLocalVideo(stream, 'padrao');
                    easyrtc.addStreamToCall(otherID, 'padrao');

                },
                function (errCode, errText) {
                    easyrtc.showError(errCode, errText);
                }, 'padrao')

                // Caso algum problema ocorra em 5s e eu não obtenha stream do outro usuário eu fecho e abro novamente a minha
                setTimeout(function(){
                    let anotherStreamWasReceived = easyrtc.getRemoteStream(otherID)
                    console.log(anotherStreamWasReceived)
                    if (anotherStreamWasReceived === null) {
                        easyrtc.closeLocalStream(streamVigente.streamName)
                        easyrtc.setVideoSource(objetoVideo[0].deviceId);
                        easyrtc.initMediaSource(
                            function(stream) {
                                console.log(stream)
                                console.log('verificando se quando o bug ocorre ele entra na criação do video')
                                streamVigente = stream
                                createLocalVideo(stream, 'padrao');
                                easyrtc.addStreamToCall(otherID, 'padrao');
                                
                            },
                            function(errCode, errText) {
                                easyrtc.showError(errCode, errText);
                            }, 'padrao')  
            
                    }
                },5000)
        } */

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
        return parametros
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
    console.log('VENDO ONDE ENTRA O BOTÃO DO CHAT')
    somaMsgRcebida = 0
    let closeChatButton = document.querySelector('#menu-click')
    document.querySelector('#contadorMsg').style.display = 'none'
    closeChatButton.addEventListener("click", function (event) {
        somaMsgRcebida = 0
        console.log('vendo quando vai entrar 1')
    })

    console.log(easyrtc)

    let buttonMsg = document.getElementById('enviar_menssagem');
    buttonMsg.onclick = function () {
        easyrtc.sendDataP2P(outroID, 'msg', false);
        if (easyrtc.roomData.default.clientListDelta!== undefined) {
            if (easyrtc.roomData.default.clientListDelta.removeClient!== undefined) {
                location.reload();
            }
        } 
        sendStuffP2P(outroID); //envia a mensagem pro outro usuário
        // scrollBottom()
    
    };

    let inputEnviarMsg = document.querySelector('#menssagem')
    let lastMsg;
    inputEnviarMsg.addEventListener("input", function (event) {
        console.log('teste digitando')
        easyrtc.sendDataP2P(outroID, 'msg', true);
        lastMsg = Date.now()
        if (inputEnviarMsg.value === '') {
            easyrtc.sendDataP2P(outroID, 'msg', false);
        }

/*         setTimeout(() => {
            console.log('testando timeout do digitando')
            if ((Date.now() - lastMsg) > 3000) {
                console.log('teste')
                easyrtc.sendDataP2P(outroID, 'msg', false);
            }
            lastMsg = 0
        }, 3000); */

    })

    inputEnviarMsg.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            easyrtc.sendDataP2P(outroID, 'msg', false);
            if (easyrtc.roomData.default.clientListDelta!== undefined) {
                if (easyrtc.roomData.default.clientListDelta.removeClient!== undefined) {
                    location.reload();
                }
            } 
            sendStuffP2P(outroID); //envia a mensagem pro outro usuário
            // scrollBottom()            
        }
    });
}

function pegarDataAtual() {
    var dataAtual = new Date();
    // var dia = (dataAtual.getDate()<10 ? '0' : '') + dataAtual.getDate();
    // var mes = ((dataAtual.getMonth() + 1)<10 ? '0' : '') + (dataAtual.getMonth() + 1);
    // var ano = dataAtual.getFullYear();
    var hora = (dataAtual.getHours() < 10 ? '0' : '') + dataAtual.getHours();
    var minuto = (dataAtual.getMinutes() < 10 ? '0' : '') + dataAtual.getMinutes();
    // var segundo = (dataAtual.getSeconds()<10 ? '0' : '') + dataAtual.getSeconds();

    var dataFormatada = " " + hora + ":" + minuto;
    return dataFormatada;
}

// Funções para o funcionamento do chat

// Função que adiciona a caixa de texto do chat a mensagem que foi enviada
function addToConversation(who, msgType, content) {
    console.log(content)
    console.log(typeof content)

    console.log('vendo se essa funcao chama toda vez que fecho stream')
    // Escape html special characters, then add linefeeds.

    /*     if (easyrtc.roomData.default.clientListDelta.removeClient!== undefined) {
            location.reload();
        } */

    if (typeof content === 'object') {
        console.log(content)
        
        let vendo = easyrtc.getRemoteStream(outroID)
        console.log(vendo)
        
        var item = document.getElementById("callerVideo");
        easyrtc.setVideoObjectSrc(item, '')
        easyrtc.clearMediaStream(item)
        streamCaller = null
        setTimeout(function () {
            console.log(objetoVideo)
            console.log('verificando antes do if do bug original')
            if (objetoVideo.length === 0) {
                // location.reload();
            }
            if (streamCaller === null) {
                console.log('verificando dentro do if do bug original')
                easyrtc.closeLocalStream(streamVigente.streamName)

                easyrtc.getVideoSourceList(function (videoSrcList) {

                    console.log('verificando se sou acionado aqui sendo host 2')
                    easyrtc.setVideoSource(videoSrcList[0].deviceId);
                    easyrtc.initMediaSource(
                        function (stream) {
                            console.log(stream)
                            streamVigente = stream
                            createLocalVideo(stream, 'padrao');

                            easyrtc.addStreamToCall(outroID, 'padrao');

                        },
                        function (errCode, errText) {
                            easyrtc.showError(errCode, errText);
                        }, 'padrao')
                })
            }
        }, 2000)
        // easyrtc.closeLocalStream(streamCaller.streamName)
    }

    if (typeof content !== 'object') {
        let username = ""
        if (who != 'Eu') {
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
        if (typeof content === 'boolean') {
            let chatEnviando = document.querySelector('#isTexting')
            if (content) {
                
                chatEnviando.style.display = 'block'
                chatEnviando.innerHTML = `${username} está digitando...`

                setTimeout(() => {
                    chatEnviando.style.display = 'none'
                }, 2000);
            } else {
                chatEnviando.style.display = 'none'
            }
        } else {
            content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            content = content.replace(/\n/g, '<br />');
            var divCaixaMsg = document.getElementById('conversation')
            var divMsgEnviada = document.createElement("div")
            divMsgEnviada.className = "textoBox"
            divCaixaMsg.appendChild(divMsgEnviada)
            divMsgEnviada.innerHTML +=
                "<b>" + username + "<span class = 'horaChat'>" + pegarDataAtual() + ":" + "</span>" + "</b>" + "<br>" + content;
            divMsgEnviada.id = who
            if (divMsgEnviada.id === 'Eu') {
                divMsgEnviada.style.backgroundColor = "#2066a2"
                divMsgEnviada.querySelector('b').style.color = "#e7e7e7"
                divMsgEnviada.querySelector('span').style.color = "#392626"
                // teste2.style.textAlign = "right"
                // teste2.querySelector('.textMsg').style.textAlign = "right"
                // "<p class='textMsg'>"+
            } else {
                if (!chatOpen) {
                    somaMsgRcebida+=1
                    let contadorMsg = document.querySelector('#contadorMsg')
                    contadorMsg.innerHTML = somaMsgRcebida
                    document.querySelector('#contadorMsg').style.display = 'block'
                } else {
                    document.querySelector('#contadorMsg').style.display = 'none'
                }
                divMsgEnviada.style.backgroundColor = "#e7e7e7"
                divMsgEnviada.style.color = "#000"
            }
        }
        if (chatOpen) {
            scrollBottom()
        }
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

function vincularIdBotaoArq() {

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
    if (!chatOpen) {
        somaMsgRcebida+=1
        let contadorMsg = document.querySelector('#contadorMsg')
        contadorMsg.innerHTML = somaMsgRcebida
        document.querySelector('#contadorMsg').style.display = 'block'
    } else {
        document.querySelector('#contadorMsg').style.display = 'none'
    }

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


    console.log(document.getElementById('conversation').querySelectorAll('.receiveBlock'))
    var nodeListDivReceive = document.getElementById('conversation').querySelectorAll('.receiveBlock')

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
        receiveBlock.innerHTML = "<b>" + username + "</b>" + "<span class = 'horaChat'>" + pegarDataAtual() + ":" + "</span>" + "<br>" + fileNameList[i].name + "(" + fileNameList[i].size + " bytes)"
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
    const indexNodeList = nodeListDivReceive.length - 1
    button1.onclick = function () {
        console.log(statusDownload)
        console.log('entrei no botão do accept')
        // jQuery(receiveBlock).empty();
        if (statusDownload === 'done') {
            wasAccepted(true);
            carregando.style.display = "inline-block"
            posicaoNodeListReceive = indexNodeList
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
    if (chatOpen) {
        scrollBottom()
    }
}

/* Essa função também é passada pra biblioteca como parametro e ela é acionada após a pessoa apertar o botão de download(wasAccepted como true)
através dela eu posso acompanhar o status do download do arquivo */
function receiveStatusCB(otherGuy, msg) {
    console.log('entrei no recebimento de arquvo 2')
    var receiveBlock = document.getElementById('receivearea');
    var carregandoDownload = document.querySelectorAll('#imagemDownload')
    statusDownload = msg.status
    if (msg.status === 'done') {
        console.log(carregandoDownload)
        console.log(posicaoNodeListReceive)
        carregandoDownload[posicaoNodeListReceive].style.display = 'none'
        if (!receiveBlock) return;
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
            let link = document.getElementById('link');
            let objectURL;

            emissor.className = "fileSender"
            conversation.appendChild(emissor)
            console.log(fileInput.files)
            console.log(fileInput.files[0].name)
            console.log(fileInput.files[0].size)
            var mandarAceito = [{
                name: fileInput.files[0].name,
                size: fileInput.files[0].size
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

                emissor.innerHTML = "<b>" + username + "</b>" + "<span class = 'horaChat'>" + pegarDataAtual() + ":" + "</span>" + "<br>" + mandarAceito[i].name + "(" + mandarAceito[i].size + " bytes)"
            }
            //
            // provide accept/reject buttons
            //

            console.log(verificador)
            if (verificador !== undefined) { // verifica se a função update foi chamada no caso do arquivo maior que 20gb
                console.log('teste')
                emissor.innerHTML = "<b>" + username + "</b>" + "<span class = 'horaChat'>" + pegarDataAtual() + ":" + "</span>" + "<br>" + "Download acima de 20mb não permitido"
            } else {
                var button = document.createElement("button");
                button.className = "botaoDownload"
                button.innerHTML = '<i class="fas fa-download"></i>'
                const posicaoDownloadSender = contador; // definindo essa constante antes do onlink ele fica vinculado a posição certa
                button.onclick = function () {
                    const file = arrayFiles[posicaoDownloadSender][0] // o posicao me da a posição exata que o onclick tá vinculado o [0] é padrão do file transfer
                    objectURL = URL.createObjectURL(file); //  transforma o arquivo em uma url
                    link.download = arrayFiles[posicaoDownloadSender][0].name // coloca o nome correto do arquivo
                    link.href = objectURL; // atribui o objeto url ao href do link

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
    scrollBottom()
    return true;
}

var noDCs = {}; // which users don't support data channels


function filesHandler(files) {
    console.log('onde chama 1')
    // if we haven't eastablished a connection to the other party yet, do so now,
    // and on completion, send the files. Otherwise send the files now.
    var timer = null;
    if (easyrtc.getConnectStatus(outroID) === easyrtc.NOT_CONNECTED && noDCs[selfEasyrtcid] === undefined) {
        //
        // calls between firefrox and chrome ( version 30) have problems one way if you
        // use data channels.
        //

    }
    else if (easyrtc.getConnectStatus(outroID) === easyrtc.IS_CONNECTED || noDCs[selfEasyrtcid]) {
        console.log('onde chama 2')

        if (!fileSender) {
            console.log('onde chama 3')
            fileSender = easyrtc_ft.buildFileSender(outroID, updateStatusDiv);
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
function converteData(data) {
    var temporario = data.split("DATA=")
    temporario[1] = new Date(parseInt(temporario[1]))
    return temporario[1]
}

// Funções de loginSuccess e loginFailure que são chamadas assim que a pessoa loga, sendo chamada loginSucess se der certo e failure se der errado

// Aqui nos executamos alguns restrições de tempo(30 min), quantidade de conexões (2) e verificação se o Status(equip_agenda) está correto
function loginSuccess(easyrtcid) {

    console.log(easyrtc)
    selfEasyrtcid = easyrtcid;
    console.log(selfEasyrtcid)
    // Tratamento do envio e recebimento de arquivo
    fileInput = document.getElementById("enviar_arquivo");
    var dropArea = document.createElement("div");
    easyrtc_ft.buildDragNDropRegion(dropArea, filesHandler); //função que constrói a transferência de arquivos
    fileInput.addEventListener('change', function () { // evendo que escuta o ato de enviar um novo arquivo
        let limitadorDownload = this.files[0].size / (1024 * 1024)
        console.log(this.files[0].size)
        console.log(this.files[0].size / (1024 * 1024))

        if (limitadorDownload <= 20) { // limita o tamanho maximo do arquivo
            arrayFiles[contador] = [this.files[0]] // array global de arquivos que foram enviados 
            filesHandler(fileInput.files);
            contador += 1 // o próximo arquivo vai pra proxima posição do array
            console.log(contador)

        } else { // Caso o arquivo seja maior que 20mb
            updateStatusDiv({ seq: 1, status: "waiting" }, true)
        }


    });
    easyrtc_ft.buildFileReceiver(acceptRejectCB, blobAcceptor, receiveStatusCB); // constroi as funções callback que interagem com a transferência de arquivos
    // Fim do tratamento do envio e recebimento de arquivo

    console.log(selfEasyrtcid)
    var logar = true;
    var cont = 0
    for (var tagConnection in easyrtc.roomData.default.clientList) {
        if (validadorConexao.toString() === easyrtc.idToName(tagConnection)) { // contador de usuários tentando se conectar na mesma sala
            //easyrtc.setRoomOccupantListener(vincularIdBotao);
            cont += 1
        }
        let now = new Date()
        let horaEntrada = new Date(now.valueOf() - now.getTimezoneOffset() * 60000)
        var horaLimite = converteData(easyrtc.idToName(tagConnection))
        //var intervalo = Date.parse(horaFinal) - Date.parse(horaInicial)
        // Verifica se o time atual está dentro do limite passado como parametro pela URL, também verifica a data
        if (Date.parse(horaEntrada) <= Date.parse(horaLimite) && horaEntrada.toDateString(horaEntrada) === horaLimite.toDateString(horaLimite)) {
            logar = true
        } else {
            logar = false
        }
    }

    let urlDirecionamento;

    if (chaveValor[5] === undefined) { // verifica se eu tenho o campo URL, nesse caso estou vindo do agenda e serei direcionado pra lá
        urlDirecionamento = "erro.html"
    } else {
        urlDirecionamento = "erro.html" + "?URL=" + chaveValor[5].substring(chaveValor[5].indexOf("=") + 1);
    }

    if (cont > 2) { // permite que apenas dois usuarios se conectem
        console.log('teste')
        easyrtc.disconnect();
        window.location.href = urlDirecionamento;
    }
    if (logar === false) {
        easyrtc.disconnect();
        window.location.href = urlDirecionamento;
    }

    if (conexao.STATUS != "OK") {
        if (conexao.STATUS === "Conf") {

        } else {
            easyrtc.disconnect();
            window.location.href = urlDirecionamento;
        }
    }

}

// Aqui adaptamos a função loginFailure para caso a pessoa não tenha camera possa se conectar apenas com audio
function loginFailure(errorCode, message) {
    console.log(errorCode)
    console.log(message)

    if (message.toString() === "Failed to get access to local media. Error code was NotFoundError.") {
        alert("Você está sem transmitir vídeo, ou você não possui um dispositivo de vídeo ou alguma configuração do seu navegador não permite utilizar o mesmo")
        easyrtc.enableVideo(false)
        easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
    }

    if (message.toString() !== "Failed to get access to local media. Error code was NotFoundError.") {
        easyrtc.showError(errorCode, message);
    }
}

function sair() {
    //window.location.href = "salaEspera.html";
    if (chaveValor[5] !== undefined) {  // verifica se eu tenho o campo URL, nesse caso estou vindo do agenda e serei direcionado pra lá
        if (conexao.STATUS === 'Conf') {
            window.location.href = conexao.URL
        } else if (conexao.STATUS === 'OK') {
            window.location.href = conexao.URL + "/salaEspera.html"
        }
    } else {
        window.location.href = "sair.html"
    }
}

function detectBrowser() {

    console.log('teste se entra pip 2')

    const pip = document.querySelector('#PIPBtn')

    let isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    let isFirefox = typeof InstallTrigger !== 'undefined';

    let isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    let isIE = false || !!document.documentMode;

    let isEdge = !isIE && !!window.StyleMedia;

    let isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    let isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

    if (isOpera) {
        return 'Opera'
    } else if (isFirefox) {
        pip.style.display = 'none'
        return 'Firefox'
    } else if (isEdge) {
        pip.style.display = 'none'
        return 'Edge'
    } else if (isSafari) {
        pip.style.display = 'none'
        return 'Safari'
    } else if (isIE) {
        pip.style.display = 'none'
        return 'IE'
    } else if (isChrome) {
        return 'Chrome'
    } else if (isEdgeChromium) {
        return 'EdgeChromium'
    } else {
        pip.style.display = 'none'
        return 'Browser desconhecido'
    }
}

async function videoFlutuante() {
    console.log('teste se entra pip 1')
    if (detectBrowser() === 'Opera' || detectBrowser() === 'Chrome' || detectBrowser() === 'EdgeChromium') {
        console.log('se entra no if detect browser')
        const video = document.querySelector('#callerVideo');
        await video.requestPictureInPicture();
    }

}