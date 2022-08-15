# Discord-bot-with-user-interphase

This app will give your discord bot a UI so you can update it without having to stop it and start it every time, right now you can chenge the bot's status, presence, name and avatar, but I have more plans to this app.

To start the app just double click to [start.bat](../../start.bat) or in the console run npm run start.
Remember to use npm install after downloading the app to install all the libraries.

### Known issues:
> **When I run the app the bot starts, but the app freezes**
```
Sometimes the first time you open the app it cant get the preload.js file so it wont do anything.
Just close and open again the app.
```
> **Streaming displays as playing in discord**
```
Right now if you set the bot's activity to streaming you won't be able to set a twitch channel.
That is causing the error but you can easily change the value of the option user in the field presence in config.json to your 
twitch channel and restart the app to change it in discord (I'll fix that later).
```

### How does this work?
> **Startup:**
```
Maybe you have noticed that there is no config.json file or anywhere to save your bot's token, well this is basically because it
will be created after you start the app for the first time, and when this happen the app will ask you to insert your bot's token,
after that you will be able (by now) to change thr basic details of your bot's precence (status, activity and activity name) and
to change your bot's name and avatar.
```
> **Bot edition:** 
```
After successfully logging in your bot you'll be able to see your bot's basic info in the left side od the app and in the other 
side you'll see a warning and two buttons: the edit button and the reset button, if you select the edit button the app will 
display an edition pannel, in the top-right corner there is a cancel button to cancel every change you were working on, the rest
is quite straight forward, just fill the fields you want to change and done! click the edit button in the bottom of the panel
and all the changes will be applied to your bot unless you give an unvalid value to any field, in that case the app will let you
know. In the bottom of the page will also appear a field to change your bot if you want.
```
> **Change of bot:**
```
This part is very easy to undertand, insert another token in the input, wait some time, and done! the process works by destroying
the bot and creating another, so if you insert an invalid token you may see how your bot goes offline and then online again, 
don't worry, it is meant to work that way.
```
> **Reset your bot:**
```
If you don't see a change applied to your bot first wait some time, sometimes it takes a while to change some aspects of the bot
(such as avatar or name) if that doesn't work, then you can press the reset button in the startpage this will destroy the bot and
then create it again, the app will also update in case there was an error there, if you see an error with the app that repeats
constantly, let me know so I can try to fix it!
```

###Looking good, what now?
By the moment I havent added a lot of features that I would like to in the future, but 
