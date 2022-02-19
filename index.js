//dotenv API
//Normally we do not include our .env in our production app but for this excercise a .env with all the secret variables is included to allow the program to run without effort
require('dotenv').config();
if (process.env.NODE_ENV !== 'production') {
    console.log("In developement mode");
}

//import our NameGenerator.js
const nameGen = require('./nameGenerator');

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
let WorldTime = 0; //World simulation time
let userIDs = 0; //gives us amount of users in a building
let eleIDs = 0; //gives us amount of elevators in a building
let corpIDs = 0; //gives us amount of corperation we want to simulate
const LunchFloors = [3,7,11,15,19,23]; //we designate lunch floors and lunch floors can also be work floors
const WorkFloors = [0,1,2,4,5,6,8,9,11] //we designate work floors but work floors cannot be designated as lunch floors
let CorpArray = [];
let ElevatorArray = [];
let UserArray = []; //Array of generated user created by our PUT API. Normally we would write this to our database

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
        Users: howManyUsers
    }

    //Creating Elevators
    for(let i = 0; i < howManyElevators; i++){
        GenerateElevators(corpIDs);
    }

    //Creating Users
    for(let i = 0; i < howManyUsers; i++){
        GenerateNewUser(nameGen.getRandomName());
    }

    //Normally we add this value to a database
    CorpArray[corpIDs] = Corp;

    console.log("Corp: " + Corp.id + "\nMax Floors: " + Corp.MaxFloor + "\nElevators Amount: " + Corp.Elevators + "\nUsers Amount: " + Corp.Users)
    //Update our corpID
    corpIDs++;
}

function getCorpMaxFloor(id)
{
    //return CorpArray[id].MaxFloor;
}
//END OF CORPERATION

//Generate Elevators for Corperation
function GenerateElevators(corpid)
{
    let ele = 
    {
        id: eleIDs,
        corpid: corpid,
        currentActivity: 'Idle',
        currentFloor: 0,
        availibleFloor: getCorpMaxFloor(corpid),
    }
    
    //we should keep track of how many we have total and corperation it belongs too
    ElevatorArray[eleIDs] = ele;

    //Update unique elevator ID
    eleIDs++;
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
        currentActivity: 'spawn',
        Username: newUser,
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
app.put('/api/users/',(req,res) => {
    
    const { id } = req.params;

    if(!id){
        res.status(418).send({message: 'We need an id for our generated user!'})
    }
    else
    {
        //lets generate some data for our new user
        var newUser = GenerateNewUser(nameGen.getRandomName()); 

        res.status(200).send({UserArray})
    }
});

//GET API

//get a list of all corperation
app.get('/api/corps',(req,res) =>
{
    res.send(CorpArray);
});

//get a list of all elevators
app.get('/api/elevators',(req,res) =>
{
    res.send(ElevatorArray);
});

//get a list of all users
app.get('/api/users',(req,res) =>
{
    //Here we generate our first person with some random data except the Username
    if(userIDs == 0)
    {
        //Normally we would use a databse to hold these values but for simplicity we will hold our data in the app session.
        UserArray[userIDs] = GenerateNewUser("Khen Prel");//Generating our first user

        res.send(UserArray)
    }
    else
    {
        //return a full list of user in our database
        res.send(UserArray)
    }
});

//START APP

//We can generate this multiple times to increase simulation amount. Elevators and Users will be contain in their corperation
GenerateCorp(getRandomNumber(1,30),getRandomNumber(10,100));


//END APP


