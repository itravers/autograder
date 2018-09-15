import shutil
import subprocess
import os
def test():

   #copy over extra files
   command = os.path.join('temp', 'main.exe')
   tests = [
            'test1_add.txt', 
            'test2_update.txt', 
            'test3_remove.txt',
            'test4_compound1.txt',
            'test5_compound2.txt',
            'test6_compound3.txt']
   for test in tests:

      test_name = os.path.splitext(test)[0]

      #doing a copy for ever test ensures purity in the event that
      #the student's EXE screws things up
      copy_files()
      test_command = '< ' + test #command + " < temp/" + test
      result = ""
      '''
      try:
         print(test_command)
         result = subprocess.check_output(test_command).decode('utf-8')
         print(result)
      except:
         print("Failed to compile project\n")
      '''
      os.chdir('temp')
      with open(test, 'rb') as input_file:
         data = input_file.read() 
      result = subprocess.run(['main.exe'], input=data, capture_output=True, timeout=5)#, stdout=subprocess.PIPE, shell=True)
      result = result.stdout.decode('utf-8').strip()
      with open('output_' + test, 'w') as output_file:
         print(result, file=output_file)
      shutil.copy('inventory.csv', test_name + '_inventory.csv')
      os.chdir('../')


def copy_files():
      items = os.listdir('pa1')
      for item in items:
         shutil.copy(os.path.join('pa1',item), 'temp')
if __name__ == '__main__':
   test()