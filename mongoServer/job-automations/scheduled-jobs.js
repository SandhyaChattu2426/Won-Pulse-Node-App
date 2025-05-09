const cron = require("node-cron");

//
cron.schedule('0 44 16 * * *', async () => {  //seconds minutes hours dayOfMonth month dayOfWeek
    console.log("Running scheduled job at 4:27 PM every day");
});

cron.schedule('00 00 * * * *', async () => {
    
});