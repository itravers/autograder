class ServerConstants{
   constructor(){
      this.mode = "debug";
      this.data_dir = '../data';
      this.temp_folder = this.data_dir + '/temp';
      this.uploads_folder = this.data_dir + "/uploads";

      this.all_folders = [this.data_dir, this.temp_folder, this.uploads_folder];
   }
}

exports.ServerConstants = function(){
   return new ServerConstants();
}