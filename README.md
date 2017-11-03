Welcome to the longitudinalGamifiedStopSignalTask wiki!
# Longitudinal Gamified Stop Signal Task
This is the public codebase for the site used to run the study registered here: https://osf.io/ysaqe/
Feel free to look through the code or download it and use it to run your own study

It is based on PixiJS, a 2d web rendering engine, and Google Firebase. Firebase handles the hosting of the task, and the storage of all data, while Pixi handles the display of the task. 

# Set up Guide
1) Clone this git repo
2) Download the latest version of pixi.input.js which I believe is found here: https://github.com/SebastianNette/PIXI.Input/pull/4/files
3) Download Datejs which can be found here: http://www.datejs.com/
4) Download pixi-multistyle-text.js which can be found here: https://github.com/tleunen/pixi-multistyle-text
5) Download FileSaver.js which can be found here: https://github.com/eligrey/FileSaver.js/
6) Download Pixi.js version 3.0.7 which should be found here: https://github.com/pixijs/pixi.js/releases/tag/v3.0.7
7) Place these 5 files into the public\js\libs folder
8) Now, create your own Firebase https://firebase.google.com/ (this study uses an old version of firebase, so you shouldn't need to do as much setup at the walkthroughs on Firebase suggest)
9) You'll need to go through the Project looking for "todo" comments which direct you to the changes you need to make in the source files to hook this site up to your Firebase.
10) you may need to install Node.js and GoogleCloudSDKInstaller to be able to run a local server, or deploy to firebase
10) This should be enough to get your project off the ground, though please contact me if you have any questions. I realise this readme leaves a lot to be desired.

## Important Class Overview
### Session.js
Instantiated for each Session begun by a participant. Stores session specific data and functions for calculating summary data.
### Trial.js
Created for each trial of the SST, and stores all the info on that trial. Is little more than a data storage object.
### DBInterface.js
Contains the majority (should contain all) functions which actually write or read the Firebase DB.
### QuestionnaireFactory.js
Builds arrays of screens that deliver the various questionnaires. As a result, contains all the text for each question delivered.
### setupDatabase.js
Runs the code that the Backend.html uses to access the database. Not used in the main task at all.
### Staircase.js
Instantiated for each staircase (1-4) used in the Stop Signal Task. Stores the step size, current SSD value for that staircase, and the functionality that controls movement up and down the staircase.
### VisabilityMonitor.js
Handles logging activity to the DB every time the screen is changed or the viewstate alters. 
### Engine.js
Inherits View. This is the main class that runs the SST. Contains a series of chained functions that cause the loop of each trial, and lots of task variant specific adjusts to the task. Also handles the scoring mechanism for the Points variant. 
### GenericScreen.js
Inherits View. This screen takes an Options object and can be used to create several different useful screens for the task, such as displaying text-based instructions or displaying a picture.
### History.js
Inherits View. This page displays a tabular view of a participants history, using Pixi Graphics to draw a table
### Map.js
Inherits View. Displays the map picture, and builds mouse-over hovers in the correct places for the levels the participant has completed. Also adds the correct progress line to the image. 
### MainMenu.js
Inherits View. This class builds the Main Menu Screen and customises it according to the task variant required.
### View.js
This class is the basic class for 'a screen' which can be moved between by the participant as they complete the study. It controls the removal of objects from itself when the view is changed, and handles the basic variables that are present on every screen. 
### ViewManager.js
This class controls the movement between the various screens, maintains a master map of ViewName -> ViewObject pairings which allow screens to be moved between by name only. It constantly monitors the "should we move to a new screen" flag that each View carries, ensuring that when a button is pressed, the moving from one screen to another is detected and processed when the next frame rolls around. It handles the graceful creation and deconstruction of views as they move in and out of existence. 
### introductionScreen.js
The introduction screen is the landing page which allows participant's to convert a prolific ID into a url from which they can take part in the study. It uses PIXI, but is very stripped down and self contained in comparison to the main task.
### Main.js
This is the main js file in the project, and handles the setup of everything, before the main menu screen is created. Here you'll find the functions handling participant login, session creation, asset loading, the basic mainloop, and the schedule creation code (which generates the screens needed for each day). This main loop also hooks into the currentscreen's mainloop via the ViewManager.

# Known Problems
* Security could be stronger and I'd recommend moving to the Firebase Auth system if the kind of study you're running supports it. 
* The Schedules are constructed in the bottom of the Main.js file, which is fairly ugly. It probably deserves it's own Class
* Users on slow or old computers sometimes experienced very slow running of the task. Turning on hardware acceleration in the browser can help this.
* Having participants type in their Prolific ID day after day can lead to typos, which can be detected fairly easily, but may still cause problems
* Much of the code is not so pretty, and for that I'm sorry. This was put together fairly quickly, and continues to improve in quality over future iterations.

# Notes 
* If you reuse this code please let me know at jim.lumsden@bristol.ac.uk 
* If you reuse this code please attribute me.
* If you reuse the artwork, please attribute Melissa Groves
