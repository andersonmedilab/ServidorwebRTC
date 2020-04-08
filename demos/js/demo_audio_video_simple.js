var selfEasyrtcid = "";
var parametrosUrl;
var conexao = new Object();
maxCALLERS = 2;

function connect() {
    easyrtc.setVideoDims(640,480);
    easyrtc.setRoomOccupantListener(callEverybodyElse);
    easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
    CapturaParametrosUrl();
    easyrtc.setUsername(parametrosUrl.toString());

     var chaveValor = parametrosUrl.toString().split(",");
     //console.log(chaveValor);

     conexao[chaveValor[0].substring(0, chaveValor[0].indexOf("="))] = chaveValor[0].substring(chaveValor[0].indexOf("=") + 1);
     conexao[chaveValor[1].substring(0, chaveValor[1].indexOf("="))] = chaveValor[1].substring(chaveValor[1].indexOf("=") + 1);
     conexao[chaveValor[2].substring(0, chaveValor[2].indexOf("="))] = chaveValor[2].substring(chaveValor[2].indexOf("=") + 1);
     //console.log(conexao);
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
    
    for(var easyrtcid in otherPeople ) {
        if (parametrosUrl.toString() === easyrtc.idToName(easyrtcid)){
            var intervalo = easyrtc.roomData.default.clientList[selfEasyrtcid].roomJoinTime - easyrtc.roomData.default.clientList[easyrtcid].roomJoinTime;

            if (convertMiliseconds(intervalo) < 30){
                list.push(easyrtcid);
                establishConnection(list.length-1);
            }else{
                window.location.href = "erro.html";
            }
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

function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    var cont = 0
    for(var tagConnection in easyrtc.roomData.default.clientList){
        if (parametrosUrl.toString() === easyrtc.idToName(tagConnection)){
            cont+=1
        }
    }

    if(cont > 2){
        easyrtc.disconnect();
        window.location.href = "erro.html";
    }
}

function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}