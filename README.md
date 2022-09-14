# Discord.JS bot with User Interphase

This app will give your discord bot a UI so you can update it without having to stop it and start it every time, right now you can change the bot's status, presence, name and avatar, but I'm working in more stuff for this app.

### Before starting

- This is a **Node.js Application** so you need to have [Node.js](https://nodejs.org/es/) installed (I'm currently using Node.js v18.6.0).
- The libaries I'm using for this project are [Discord.js](https://discord.js.org/#/) (v14.0.3) and [Electron.js](https://www.electronjs.org/) (v20.0.3).
- I know that the methods I use may be a bit strange, that's mainly because I learned coding by myself, sorry about that.
- The whole project is in spanish because I made it for myself, but If you want it in another language, feel free to change it.
- This is my first GitHub submission so if I missed something please let me know.

> _Remember to run_ ``npm install`` _after downloading the app to install all the libraries._

To start the app just double click [start.bat](./start.bat) or in the console run ``npm run start``.

### How does this work?
- **Startup:**
> Maybe you have noticed that there is no config.json file or anywhere to save your bot's token, well this is basically because it will be created after you start the app for the first time, and when this happen the app will ask you to insert your bot's token, after that you will be able (by now) to change thr basic details of your bot's precence (status, activity and activity name) and to change your bot's name and avatar.

- **Bot edition:** 
> After successfully logging in your bot you'll be able to see your bot's basic info in the left side of the app and in the other side you'll see a warning and two buttons: the edit button and the reset button, if you select the edit button the app will  display an edition pannel, in the top-right corner there is a cancel button to cancel every change you were working on, the rest is quite straight forward, just fill the fields you want to change and done! click the edit button in the bottom of the panel and all the changes will be applied to your bot unless you give an unvalid value to any field, in that case the app will let you know. In the bottom of the page will also appear a field to change your bot if you want.

- **Edit the bot's avatar**
> In the edition area, at the top you can find the avatar edition section, if you enter the link of a valid image and press enter or click the submit button, it will be displayed on the preview of the avatar in the left side, if you want to upload an image from your computer just click on the submit button with the input empty and you wil be able to search for a file on your computer.

- **Change of bot:**
> This part is very easy to undertand, insert another token in the input, wait some time, and done! the process works by destroying the bot and creating another, so if you insert an invalid token you may see how your bot goes offline and then online again, don't worry, it is meant to work that way.

- **Reset your bot:**
> If you don't see a change applied to your bot first wait some time, sometimes it takes a while to change some aspects of the bot (such as avatar or name) if that doesn't work, then you can press the reset button in the homepage this will destroy the bot and then create it again, the app will also update in case there was an error there, if you see an error with the app that repeats constantly, let me know so I can try to fix it!

### Known issues:
- **When I run the app the bot starts, but the app freezes**
> Sometimes the first time you open the app it can't get the [preload.js](./preload.js) file so it wont do anything.

>Just close and open again the app!

### Looking good, what now?
By the moment I haven't added some features because I want to improve the code of the app, but I'm still working on them, here is the list (I may be updating this while I add or want more features so feel free to make any sugestion).

- **Guilds section:**
> A section where you will be able to see the guilds your bot is in and have the option to join or make your bot leave it or even send a message or embed from the bot.
