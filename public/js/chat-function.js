const incomingMessageAudio=new Audio('./audio/audio_1.wav')
const outgoingMessageAudio=new Audio('./audio/audio_2.wav')

const playAudio=(sit)=>{
    console.log(sit)
    if(sit==='incoming'){
        incomingMessageAudio.play()
    }else if(sit==='outgoing'){
        outgoingMessageAudio.play()
    }
}