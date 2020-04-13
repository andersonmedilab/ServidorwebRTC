var selfEasyrtcid = "";
var parametrosUrl;
var conexao = new Object();
maxCALLERS = 2;

function connect() {
    easyrtc.setVideoDims(640,480);
    easyrtc.setRoomOccupantListener(callEverybodyElse);
    easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
    CapturaParametrosUrl();

     var chaveValor = parametrosUrl.toString().split(",");

     console.log(chaveValor);

     conexao[chaveValor[0].substring(0, chaveValor[0].indexOf("="))] = chaveValor[0].substring(chaveValor[0].indexOf("=") + 1);
     conexao[chaveValor[1].substring(0, chaveValor[1].indexOf("="))] = chaveValor[1].substring(chaveValor[1].indexOf("=") + 1);
     conexao[chaveValor[2].substring(0, chaveValor[2].indexOf("="))] = chaveValor[2].substring(chaveValor[2].indexOf("=") + 1);
     conexao[chaveValor[3].substring(0, chaveValor[3].indexOf("="))] = chaveValor[3].substring(chaveValor[3].indexOf("=") + 1);
     conexao.NOMEPACIENTE = conexao.NOMEPACIENTE.replace(/%20/g, " ")
     console.log(conexao.NOMEPACIENTE)
     validadorConexao = chaveValor[2].concat(chaveValor[3])
     validadorConexao = conexao.NOMEPACIENTE + chaveValor[2] + chaveValor[3]
     console.log(validadorConexao)
     easyrtc.setUsername(validadorConexao);
     console.log(conexao);
}

function muteActiveBox() {
    updateMuteImage(true);
}

function updateMuteImage(toggle) {
    //var muteButton = document.getElementById('muteButton');
    //if( activeBox > 0) { // no kill button for self video
        //muteButton.style.display = "block";
        var videoObject = document.getElementById("callerVideo");
        console.log(videoObject)
        var isMuted = videoObject.muted?true:false;
        if( toggle) {
            isMuted = !isMuted;
            videoObject.muted = isMuted;
        }
        //muteButton.src = isMuted?"images/button_unmute.png":"images/button_mute.png";
/*     }
    else {
        muteButton.style.display = "none";
    } */
}

function sair(){
    window.location.href = "sair.html";
}

function convertMiliseconds(millisecondVal) {
    var minuteVal = millisecondVal / 60000;
    minuteVal = Math.round(minuteVal);
    return minuteVal;
  };

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

function callEverybodyElse(roomName, otherPeople) {
    easyrtc.setRoomOccupantListener(null); // so we're only called once.
    var list = [];
    var connectCount = 0;
    console.log(roomName)
    for(var easyrtcid in otherPeople ) {
        if (validadorConexao.toString() === easyrtc.idToName(easyrtcid)){
            list.push(easyrtcid);
            establishConnection(list.length-1);
        }
    }
    //
    // Connect in reverse order. Latter arriving people are more likely to have
    // empty slots.
    //
    function establishConnection(position) {
        function successCB() {
            connectCount++;
        }
        var failureCB = function() {};
        if( connectCount < maxCALLERS) {
            easyrtc.call(list[position], successCB, failureCB);
        }
    }
}

function converteData(data){
    var temporario = data.split("DATA=")
    temporario[1] = new Date(temporario[1])
    console.log(typeof temporario[1]);
    return temporario[1]
}

function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    console.log(easyrtc)

    var logar = true;
    var cont = 0
    for(var tagConnection in easyrtc.roomData.default.clientList){
        if (validadorConexao.toString() === easyrtc.idToName(tagConnection)){
            cont+=1
            
        }
        horaFinal = new Date()
        console.log(horaFinal)
        console.log(Date.parse(horaFinal))
        
        var horaInicial = converteData(easyrtc.idToName(tagConnection))
        console.log(horaInicial)
        var intervalo = Date.parse(horaFinal) - Date.parse(horaInicial)
        console.log(horaFinal.toDateString(horaFinal))
        console.log(horaInicial.toDateString(horaInicial))
        console.log(intervalo)
        if (convertMiliseconds(intervalo) < 2 && horaFinal.toDateString(horaFinal) === horaInicial.toDateString(horaInicial)){
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
}

function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}