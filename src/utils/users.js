const users=[]

//this method -returns an object with two possible properties at one time, it will contain only one of the property either an error or
// a user, not both
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
    return {user}//returns an object with user as one of its properties -using es6 destructuting property

}

//returns a user after removing it.
const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id)

    if(index!==-1){
       return users.splice(index,1)[0]
    }
    
}
//returns a user
const getUser=(id)=>{
    return users.find((user)=>user.id===id)
}

//returns an array of users
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