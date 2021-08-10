const socket=io()


//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll=()=>{

    //New Message element - it is the last element child of our messages div, which we inserted 
    const $newMessage=$messages.lastElementChild

    //Height of the new message- contains everything margin,content etc
    const newMessageStyles=getComputedStyle($newMessage)
    console.log(newMessageStyles)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin //gives total height => margin +standard content

    //visible height - height which is visible to us on our screen
    const visibleHeight=$messages.offsetHeight

    //height of messages container - total height available for our container
    const containerHeight=$messages.scrollHeight

    //how far have we scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }


}


//Listeners
socket.on('message',(message)=>{
    console.log(message)

    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:dayjs(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
   // playAudio('incoming')
    autoScroll()
})

socket.on('locationMessage',(location)=>{

    const html=Mustache.render(locationTemplate,{
        username:location.username,
        url:location.url,
        createdAt:dayjs(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
   // playAudio('incoming')
    autoScroll()

})

socket.on('roomData',(data)=>{
    const html=Mustache.render(sidebarTemplate,{
        room:data.room,
        users:data.users
    })
    document.querySelector('#sidebar').innerHTML=html
})

//Emitters
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    //disable the submit button
    $messageFormButton.setAttribute('disabled','disabled')
    const message=e.target.elements.text.value

    socket.emit('sendMessage',message,(error)=>{

        //enable the button
        $messageFormButton.removeAttribute('disabled')

        //clear the input field
        e.target.elements.text.value=''

        //change focus back to our input field
        $messageFormInput.focus()

        if(error){
            console.log(error)
        }else{
            console.log('The message has been delivered')
            playAudio('outgoing')
        }
        
    })
    
    
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geo location is not supported by your browser')
    }

    //disabling the button
    $sendLocationButton.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
        const lat=position.coords.latitude
        const long=position.coords.longitude
        //console.log(lat,long)
        socket.emit('sendLocation',{    
            lat,
            long
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared')
            playAudio('outgoing')
        })

    })

})

//As soon as chat.js file is loaded ,this event is emmitted
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
    
})



