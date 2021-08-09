const users=[]

const addUser=({id,username,room})=>{

    //clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error:'Username and room are required'
        }
    }


    //check for existing user
    const existingUser=users.find((user)=>{
        return user.username===username && user.room===room
    })


    //Validate username
    if(existingUser){
        return {
            error:'Username is in use'
        }
    }

    //Store User
    const user={id,username,room}
    users.push(user)
    return {user}

}

const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id)

    if(index!==-1){
       return users.splice(index,1)[0]
    }
    
}

const getUser=(id)=>{
    return users.find((user)=>user.id===id)
}

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    let array=[]
    users.forEach((user)=>{
        if(user.room===room){
            array.push(user)
        }
    })
    return array
}


module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}