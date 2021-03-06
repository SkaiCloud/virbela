//dotenv API
//Normally we do not include our .env in our production app but for this excercise a .env with all the secret variables is included to allow the program to run without effort
require('dotenv').config();
if (process.env.NODE_ENV !== 'production') {
    console.log("In developement mode");
}

//import our NameGenerator.js
const nameGen = require('./src/nameGenerator');

//create our server
const express = require('express');
const app = express();
const path = require('path');

//Serve default static page.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

//let use a middleware to convert our data into json format
app.use(express.json());

//add middleware to serve our unity webgl
app.use(express.static("public"));

//if our env file is missing we will default to port 3000
const port = process.env.PORT || 3000;

//instalize our server
app.listen(port, () => console.log(`Server http://localhost:${port} is live!`));

//App Vars. We will generate random data so each time we launch the app it will be a different simulation.
let CorpAmount = 1; //default spawn how many corperation. NOTE: PLEASE DO NOT CHANGE THIS VALUE AS IT WILL BREAK UNITY3D SIMULATION.
let WorldTimeHours = 0; //World simulation time hours.
let WorldTimeMinutes = 0; //World simulation time minutes.
let userIDs = 0; //gives us amount of total users.
let eleIDs = 0; //gives us amount of total elevators.
let corpIDs = 0; //gives us amount of total corperation.
const LunchFloors = [3,7,11,15,19,23]; //we designate lunch floors. lunch floors can also be work floors.
const WorkFloors = [0,1,2,4,5,6,8,9,11] //we designate work floors but work floors cannot be designated as lunch floors.
let CorpArray = []; //Array of generated corperations.
let ElevatorArray = []; //Array of generated elevators.
let UserArray = []; //Array of generated user created by our PUT API. Normally we would write this to our database.
let ElevatorActivity = ["Idle","OpenDoor","CloseDoor","MovingUp","MovingDown","Stuck"];
let UserActivity = ["Idle","Moving","InsideElevator","ExitElevator","Working","AtLunch","DoneWithWork"];
//START OF CORPERATION - Generate our Corperation and construct API
function GenerateCorp(howManyElevators,howManyUsers)
{
    //we comnbine all the floors together to give us its max floor level
    let combinefloor = LunchFloors + WorkFloors;

    let Corp =
    {
        id: corpIDs,
        MaxFloor: Math.floor(getRandomNumber(2, combinefloor.length)),
        Elevators: howManyElevators,
        ElevatorsArrays: [],
        Users: howManyUsers,
        UsersArray:[]
    }

    //Normally we add this value to a database
    CorpArray[corpIDs] = Corp;

    //Creating Elevators
    for(let i = 0; i < howManyElevators; i++){
       Corp.ElevatorsArrays[i] = GenerateElevators(corpIDs);
    }

    //Creating Users
    for(let i = 0; i < howManyUsers; i++){
       Corp.UsersArray[i] = GenerateNewUser(nameGen.getRandomName());
    }

    //out put our creation to a console log.
    console.log("Corp: " + Corp.id + "\nMax Floors: " + Corp.MaxFloor + "\nElevators Amount: " + Corp.Elevators + "\nUsers Amount: " + Corp.Users +"\n");
    
    //Update our corpID
    corpIDs++;
}

//return the max floor amount from a corpid
function getCorpMaxFloor(id){
    return CorpArray[id].MaxFloor;
}
//END OF CORPERATION

//Generate Elevators for Corperation
function GenerateElevators(corpid)
{
    let ele = 
    {
        id: eleIDs,
        corpid: corpid,
        currentActivity: ElevatorActivity[0],
        currentFloor: 0,
        pendingFloors: [],
        passengers: [],
        currentCapacity:0,
        maxcapacity: 10,
        availibleFloor: getCorpMaxFloor(corpid),
    }
    
    //we should keep track of how many we have total and corperation it belongs too
    ElevatorArray[eleIDs] = ele;

    //Update unique elevator ID
    eleIDs++;

    return ele;
}

//START OF OUR USER DATA - Generate our user's data.
function GenerateNewUser(newUser)
{
    const varstartHour = GenerateStartingHour(); //we generate a starting hour
    const varlunchHour = ConvertTo24HRS(varstartHour,4); //we allow our users to take lunch after 4hours of work
    const varendHour = ConvertTo24HRS(varstartHour,8); //We allow our users to work for 8hrs
    let User =
    {
        id: userIDs,
        corpid: corpIDs,
        currentActivity: UserActivity[0],
        userName: newUser,
        workfloor: GenerateWorkFloor(),
        lunchfloor: LunchFloors[Math.floor(Math.random() * LunchFloors.length)],
        startHour: varstartHour,
        lunchHour: varlunchHour,
        endHour: varendHour,
        currentfloor: 0
    }

    //increment our unique ID and add to our users array
    UserArray[userIDs] = User;

    //increment our unquie ID
    userIDs++;

    return User;
}

//A function to convert our simulated time to 24hrs
function ConvertTo24HRS(currentHRS,HRStoAdd){
    let cacheCurrentHRS = currentHRS;
    let cacheHRStoAdd = HRStoAdd;
    while(cacheHRStoAdd > 0)
    {
        cacheCurrentHRS += 1;
        cacheHRStoAdd -= 1;
        if(cacheCurrentHRS === 24) cacheCurrentHRS = 0;
    }
    return cacheCurrentHRS;
}

//Generate our users starting work hours
function GenerateStartingHour(){ 
    return Math.floor(Math.random() * 24);
}

//Generate our users working floor
function GenerateWorkFloor()
{
    const totalfloors = WorkFloors.length + LunchFloors.length;
    return Math.floor(Math.random() * totalfloors);
}
//END USER DATA GENERATION

//Mis functions
//the math.random is wack!
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

//PUT API
//SATISFY PHASE 2. Update a single elevator value on a single endpoint.
app.put('/api/updateElevator/:id',(req,res) => {

    //grab the id for the endpoint
    const id = req.params.id;
    
    //Update data as nesscesary
    ElevatorArray[id].currentFloor = req.body.currentFloor;
    ElevatorArray[id].currentCapacity = req.body.currentCapacity;
    ElevatorArray[id].currentActivity = req.body.currentActivity;
    ElevatorArray[id].pendingFloors = req.body.pendingFloors;
    ElevatorArray[id].passengers = req.body.passengers;

    //Log when it update
    console.log("Elevator ID: " + ElevatorArray[id].id + " Updated");

    //Display result to user
    res.send(ElevatorArray[id]);
});

//Update elevator floor. require elevator id
app.put('/api/updateEleFloor/:id',(req,res) => {

    //grab the id for the endpoint
    const id = req.params.id;

    //Update data as nesscesary
    ElevatorArray[id].currentFloor = req.body.currentFloor;

    //Log when it update
    console.log("Elevator ID: " + ElevatorArray[id].id + " Floor Updated!");

    //Display result to user
    res.send(ElevatorArray[id]);
});

//Update elevator current capacity. require elevator id
app.put('/api/updateEleCurCap/:id',(req,res) => {

    //grab the id for the endpoint
    const id = req.params.id;

    //Update data as nesscesary
    ElevatorArray[id].currentCapacity = req.body.currentCapacity;

    //Log when it update
    console.log("Elevator ID: " + ElevatorArray[id].id + " Current Capacity Updated!");

    //Display result to user
    res.send(ElevatorArray[id]);
});

//Update elevator Activity. require elevator id
app.put('/api/updateEleAct/:id',(req,res) => {

    //grab the id for the endpoint
    const id = req.params.id;

    //Capture previous record
    let previousRecord = ElevatorArray[id].currentActivity;
    
    //Update data as nesscesary
    ElevatorArray[id].currentActivity = req.body.currentActivity;

    //Log when it update
    console.log("Elevator ID: " + ElevatorArray[id].id + " Updated it's Current Activity from: "+ previousRecord + " to: " + ElevatorArray[id].currentActivity);

    //Display result to user
    res.send(ElevatorArray[id]);
});

//PUT API END

//GET API START
//get a list of all corperation
app.get('/api/corps/',(req,res) =>
{
    //we can search and filter corperation by id, amount of floors, amount of elevators and amount of users
    const { id, MaxFloor, Elevators, Users } = req.query;
    let results = [...CorpArray];

    if (id) results = results.filter(r => +r.id === +id);
    if (MaxFloor) results = results.filter(r => +r.MaxFloor === +MaxFloor);
    if (Elevators) results = results.filter(r => +r.Elevators === +Elevators);
    if (Users) results = results.filter(r => +r.Users === +Users);

    res.send(results);
});

//get a list of all elevators
app.get('/api/elevators/',(req,res) =>
{
    //we can search and filter elevators by id, what corperation it belongs to, what currentfloors they are on, and current activities
    const { id, corpid, currentActivity,currentFloor, availibleFloor, maxcapacity } = req.query;
    let results = [...ElevatorArray];

    if (id) results = results.filter(r => +r.id === +id);
    if (corpid) results = results.filter(r => +r.corpid === +corpid);
    if( maxcapacity) results = results.filter(r => +r.maxcapacity === +maxcapacity);
    if (currentFloor) results = results.filter(r => +r.currentFloor === +currentFloor);
    if (availibleFloor) results = results.filter(r => +r.availibleFloor === +availibleFloor);
    if (currentActivity) results = results.filter(r => r.currentActivity === currentActivity);

    res.send(results);
});

//get a list of all users
app.get('/api/users/',(req,res) =>
{
    //we can search and filter user by any if there data
    const { id, corpid,workfloor,lunchfloor,startHour,lunchHour,endHour,currentActivity, userName } = req.query; 
    let results = [...UserArray];

    if (id) results = results.filter(r => +r.id === +id);
    if (corpid) results = results.filter(r => +r.corpid === +corpid);
    if (workfloor) results = results.filter(r => +r.workfloor === +workfloor);
    if (lunchfloor) results = results.filter(r => +r.lunchfloor === +lunchfloor);
    if (startHour) results = results.filter(r => +r.startHour === +startHour);
    if (lunchHour) results = results.filter(r => +r.lunchHour === +lunchHour);
    if (endHour) results = results.filter(r => +r.endHour === +endHour);
    if (currentActivity) results = results.filter(r => r.currentActivity === currentActivity);
    if (userName) results = results.filter(r => r.userName === userName);

    res.send(results);
});

//START APP
//We can generate this multiple times to increase simulation amount. Elevators and Users will be contain in their corperation
for(let i = 0; i < CorpAmount; i++){
    GenerateCorp(getRandomNumber(1,30),getRandomNumber(10,100));
}

//we output the amount of data we generated as a whole
console.log("Total Corperation Spawned: " + corpIDs + "\n" + "Total Elevators Spawned: " + eleIDs + "\n" + "Total Users Sapwned: " + userIDs + "\n")

// <---------------------------------------------TRYING TO GET SOME EXTRA CREDIT AND ATTEMPT PHASE 3 ------------------------------------------------------------->
//Things we send to Unity3d to simulate our data and React for frontend GUI
let WorldTimerString;
const RunUnityMessage = setInterval(UnityMessage,100);

function UnityMessage() {
    getTime();
}

function getTime() {
    WorldTimeMinutes += 1;
    if(WorldTimeMinutes == 60)
    {
        WorldTimeMinutes = 0;
        WorldTimeHours += 1;
        if(WorldTimeHours == 24) WorldTimeHours = 0;
    }

    WorldTimerString = WorldTimeHours.toString().padStart(2,0) + ":" + WorldTimeMinutes.toString().padStart(2,0);

    return WorldTimerString;
}

//get a list of all users
app.get('/api/gettime/',(req,res) =>
{
    res.send(WorldTimerString);
});

module.exports = { WorldTimerString };
//END APP


