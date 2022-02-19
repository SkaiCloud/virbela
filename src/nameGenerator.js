const FirstName = [
    "Charles",
    "Mike",
    "Frank",
    "Jose",
    "Mary",
    "Julie",
    "Skai",
    "Logan",
    "Sinuon",
    "Mark",
    "Aaron",
    "Pen",
    "Yarron",
    "Hunter",
    "Glass",
    "Ryan",
    "Sam",
    "Coco",
    "Fluffy",
    "Cooper",
    "Acer",
    "Max",
    "Chair",
    "Ugly"
]

const LastName = [
    "Lowen",
    "Lex",
    "Grum",
    "Luther",
    "Owen",
    "Red",
    "Blue",
    "Axis",
    "Brutto",
    "Noland",
    "Karl",
    "Clement",
    "Danger",
    "Black",
    "Proton",
    "Fatty",
    "Stinky",
    "Blacky",
    "Dark",
    "Belly"
]

function getRandomName()
{
    return getFirstName() + " " + getLastName();
}

function getFirstName(){
    return FirstName[Math.floor(Math.random() * FirstName.length)];
}

function getLastName(){
    return LastName[Math.floor(Math.random() * LastName.length)];
}

module.exports = { getRandomName };