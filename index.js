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
const res = require('express/lib/response');
const app = express();

//if our env file is missing we will default to port 3000
const port = process.env.PORT || 3000;

//let use a middleware to convert our data into a json format
app.use(express.json());

//instalize our server
app.listen(port, () => console.log(`Server http://localhost:${port} is live!`));

//App Vars. We will generate random data so each time we launch the app it will be a different simulation.
let CorpAmount = 10; //deault spawn how many corperation.
let WorldTime = 0; //World simulation time.
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
    //we dont know how much floor this corperation has so we comnbine all the floors together and sort it to get our highest floor
    let sortedArray = LunchFloors + WorkFloors;
    //sortedArray.sort();
    let Corp =
    {
        id: corpIDs,
        MaxFloor: Math.floor(getRandomNumber(2, sortedArray.length)),
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

    console.log("Corp: " + Corp.id + "\nMax Floors: " + Corp.MaxFloor + "\nElevators Amount: " + Corp.Elevators + "\nUsers Amount: " + Corp.Users +"\n");
    
    //Update our corpID
    corpIDs++;
}

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
    const varendHour = ConvertTo24HRS(varstartHour,8); //We allow our users to work for a min of 1hour

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
        endHour: varendHour
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

    //Display result to user
    res.send(ElevatorArray[id]);
});

//Update elevator floor
app.put('/api/updateEleFloor/:id',(req,res) => {

    //grab the id for the endpoint
    const id = req.params.id;

    //Update data as nesscesary
    ElevatorArray[id].currentFloor = req.body.currentFloor;

    //Display result to user
    res.send(ElevatorArray[id]);
});

//Update elevator current capacity.
app.put('/api/updateEleCurCap/:id',(req,res) => {

    //grab the id for the endpoint
    const id = req.params.id;

    //Update data as nesscesary
    ElevatorArray[id].currentCapacity = req.body.currentCapacity;

    //Display result to user
    res.send(ElevatorArray[id]);
});

//Update elevator Activity
app.put('/api/updateEleAct/:id',(req,res) => {

    //grab the id for the endpoint
    const id = req.params.id;

    //Update data as nesscesary
    ElevatorArray[id].currentActivity = req.body.currentActivity;

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
    //we can search and filter elevators by id, what corperation it belongs to, what currentfloors they are own, and current activity
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
console.log("Total Corperation Spawned: " + corpIDs + "\n" + "Total Elevators Spawned: " + eleIDs + "\n" + "Total Users Sapwned: " + userIDs + "\n")
//END APP


