import shutil
import subprocess
import os
from autograder.tester import Tester

class Pa2Tester(Tester):
   def __init__(self):
      super().__init__()

   def test(self):

      command = os.path.join('temp', 'main.exe')

      #no main, no test!
      if os.path.isfile(command) == False:
         print("Could not locate main file.  Aborting test.")
         return

      tests = [
               'test.txt']
      for test in tests:

         test_name = os.path.splitext(test)[0]

         #doing a copy for ever test ensures purity in the event that
         #the student's EXE screws things up
         print("currently in:", os.getcwd())
         self.copy_files("pa2", "temp")
         test_command = '< ' + test #command + " < temp/" + test
         result = ""
         os.chdir('temp')
         print("testing", test)
         with open(test, 'rb') as input_file:
            data = input_file.read() 
         try:
            result = subprocess.run(['main.exe'], input=data, capture_output=True, timeout=5)#, stdout=subprocess.PIPE, shell=True)
         except:
            print("Timeout on test", test)
            os.chdir('../')
            continue

         result = result.stdout.decode('utf-8').strip()
         with open('output_' + test, 'w') as output_file:
            print(result, file=output_file)
         os.chdir('../')

      #with all tests run, log results for long term
      if os.path.exists(self.output_path) == False:
         os.mkdir(self.output_path)
      destination = os.path.join(self.output_path, self.author)
      if os.path.exists(destination) == False:
         os.mkdir(destination)
      self.copy_files("temp", destination)
         


   def copy_files(self, source, sink):
         items = os.listdir(source)
         for item in items:
            shutil.copy(os.path.join(source,item), sink)

if __name__ == '__main__':
   pass