# Exercise 2 #

For this exercise you will create a REST API that supports data retrieval and requests to support elevator operation.

As you progress through the steps, feel free to add comments to the code about *why* you choose to do things a certain way. Add comments if you felt like there's a better, but more time intensive way to implement specific functionality. It's OK to be more verbose in your comments than typical, to give us a better idea of your thoughts when writing the code.

### What you need ###

* IDE of your choice
* Git
* Some chosen backend language / framework
* Some chosen local data store

## Instructions ##

### Phase 1 - Setup ###

 1. Clone this repository to your local machine
 1. Create the basic structure needed for your API with your chosen framework
 1. Add a README.md in this exercise folder with the basic requirements and steps to run the project locally

### Phase 2 - Main Implementation ###

Implement a RESTful API to support zero to many elevators in a building. Buildings *have many* elevators in this relationship. Must meet the following requirements:

 * API call can request information about the building, which will return all available elevators
 * API call can request information about an elevator in a building including, but not limited to: id, status, current floor, available floors
 * API call can command an elevator to perform actions including, but not limited to: open door, close door, go to floor

 Notes on elevator state:
 - For this phase we assume that any elevator actions are instantaneous
 - "go to floor" request for an elevator results in instant arrival at the floor and opening of the door

### Phase 3 - Stretch Goals ###

Please implement any of the following stretch goals. They are in no particular order.

 * Unit tests
 * Add some sort of logic to have the elevator intelligently position itself when not actively being used (e.g. if it was an office building, idle on lower floors in morning, upper or middle floors at the end of the workday)
 	* This could be configurable or "smart" based on trends
 * Add some type of self-documenting UI such as Swagger

### Phase 4 - SUPER STRETCH GOAL - Add queuing of floor stops ###

* Elevator actions are no longer instantaneous
	* Actions are now queued and all actions will execute when a separate API request "go" is called
	* "Go" should be applied to all elevators in a building, and all queued actions execute instantaneously
	* Elevator actions should be logged (console output is fine) and the final state available immediately

Notes:
- The concept of requesting to go up or down can be ignored for simplicity. Just stick with "go to floor"
- The elevator should be efficient in stopping at floors. If the elevator is on floor 1 and "go to floor" is queued for 5 different floors, the elevator should stop at each queued floor in a logical, efficient sequence.

## Questions ##

 1. How can your implementation be optimized?
 1. How much time did you spend on your implementation?
 1. What was most challenging for you?

## Next Steps ##

* Confirm you've addressed the functional goals
* Answer the questions above by adding them to this file
* Make sure your README.md is up to date with setup and run instructions
* Ensure you've followed the sharing instructions in the main [README](../README.md)
