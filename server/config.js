class ServerConstants{
   constructor(){
      this.mode = "debug";
      this.data_dir = '../data';
      this.temp_folder = this.data_dir + '/temp';
      this.uploads_folder = this.data_dir + "/uploads";
   }
}

exports.ServerConstants = function(){
   return new ServerConstants();
}