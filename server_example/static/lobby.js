function funcaoParaExecutar() {
    let nMedico = document.querySelector("#nMedico").value;
    let nPaciente = document.querySelector("#nPaciente").value;
    let crmMedico = document.querySelector("#crm").value;
    let json = {
        nMedico,
        nPaciente,
        crmMedico
    };

    if (!json.nMedico){
        alert("O nome do médico deve ser preenchido");
    } else if(!json.nPaciente){
        alert("O nome do paciente deve ser preenchido");
    } else if(!json.crmMedico){
        alert("O crm deve ser preenchido");
    } else {
        window.location.href = "./demos/demo_audio_video_simple.html" + "?NOMEMEDICO=" + nMedico + "&NOMEPACIENTE="+ nPaciente + "&CRM=" +crmMedico;
    }
}
    
