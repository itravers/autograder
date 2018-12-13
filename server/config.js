class ServerConstants{
   constructor(){
      
      //flag that enables certain features that make local dev easier but may be risky in production
      this.mode = "debug";

      //hash key for generating hashes 
      this.hash_key = "change this to something secret";
      this.crypto_method = "sha512";


      this.data_dir = '../data';
      this.temp_folder = this.data_dir + '/temp';
      this.uploads_folder = this.data_dir + "/uploads";

      this.all_folders = [this.data_dir, this.temp_folder, this.uploads_folder];
   }
}

exports.ServerConstants = function(){
   return new ServerConstants();
}