const fs = require('fs');

function setupFolders(server_config){

    console.log("Checking file structure.");
    for(const path of server_config.all_folders){
        console.log("Checking for " + path + "...");
        if(fs.existsSync(path) === false){
            console.log("\tNot found.  Creating.");
            fs.mkdirSync(path);
        }
    }
}


exports.setupFolders = function(server_config){
    setupFolders(server_config);
 }