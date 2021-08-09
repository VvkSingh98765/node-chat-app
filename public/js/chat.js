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


//Listeners
socket.on('message',(message)=>{
    console.log(message)

    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:dayjs(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage',(location)=>{
    const html=Mustache.render(locationTemplate,{
        username,
        url:location.url,
        createdAt:dayjs(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

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
        })

    })

})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})



