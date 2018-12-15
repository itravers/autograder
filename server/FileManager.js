const fs = require('fs');

class FileManager {
   constructor(temp_root, final_root) {
      this.temp_folder_root = temp_root;
      this.final_dest_root = final_root;
      this.unique_counter_file = this.temp_folder_root + "counter.txt";
   }

   uploadTemp(file, callback) {
      fs.readFile(this.unique_counter_file, { encoding: "utf8" }, (err, data) => {

         //get current ID counter
         const counter = Number(data);

         //update counter by 1
         fs.writeFile(this.unique_counter_file, counter + 1, { encoding: "utf8" }, (err) => {

            //make folder
            const temp_path = this.temp_folder_root + counter;
            const file_path = temp_path + "/" + file.name;

            fs.mkdir(temp_path, (err) => {
               
               //move file
               file.mv(file_path, (err) => {
                  if (err) {
                     callback(null, err);
                  }
                  else {
                     callback(counter, null);
                  }
               });
            });
         });
      });
   }
}

exports.FileManager = function (temp_folder, uploads_folder) {
   return new FileManager(temp_folder, uploads_folder);
}