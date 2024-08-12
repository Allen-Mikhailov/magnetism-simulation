import { app, signIn, auth, db, doc, getDoc, setDoc, addDoc, collection } from "./firebase.js";
import { default_simulation_data, default_user_data } from "./default_data.js";

const signin_button = document.getElementById("top-bar-sign-in")
const username_display = document.getElementById("account-rect-username")
const create_button = document.getElementById("create-button")
const simulations_list = document.getElementById("simulations-list")

let user
let user_data

async function create_new_simulation()
{
    if (!user) {return;}

    const new_simulation_data = JSON.parse(JSON.stringify(default_simulation_data))
    new_simulation_data.owner_uid = user.uid

    const docRef = await addDoc(collection(db, "simulations"), new_simulation_data)

    const simulation_id = docRef.id

    console.log(user_data)
    user_data.simulations.push(simulation_id)
    update_user_data()
}

function user_data_update()
{
    simulations_list.textContent = ""

    if (!user_data) {return;}

    user_data.simulations.map((id) => {
        const element = document.createElement("a")
        element.innerText = id
        element.href = "/simulation#"+id
        simulations_list.appendChild(element)
    })
}

function update_user_data()
{
    user_data_update()
    const docRef = doc(db, "user_data", user.uid)
    setDoc(docRef, user_data)
}

async function get_user_data()
{
    if (!user) {
        user_data = null;
        user_data_update()
        return;
    }

    const docRef = doc(db, "user_data", user.uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists())
    {
        user_data = docSnap.data()
        user_data_update()
    } else {
        user_data = JSON.parse(JSON.stringify(default_user_data))
        update_user_data()
    }
}

function userUpdate(new_user)
{
    user = new_user
    console.log("user", user)
    if (user)
    {
        username_display.innerText = user.displayName
        signin_button.style.display = "none"

        get_user_data()
    } else {
        signin_button.style.display = "block"
    }
}

auth.onAuthStateChanged(userUpdate)

signin_button.onclick = signIn

create_button.onclick = create_new_simulation

userUpdate()