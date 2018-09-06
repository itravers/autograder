import os
import subprocess
import csv
import shutil

SUBMISSION_DIRECTORY = 'to_test'
WORKSPACE_DIRECTORY = 'temp'
FILE_EXTENSION = '.html'
TESTING_FILE = 'tester.js'
TESTING_COMMAND = 'testcafe'
TESTING_OPTIONS = 'chrome'
WORKING_FILE_NAME = 'pa1.html'

def get_files(testing_location, extension):
   files_to_grade = list()
   items = os.listdir(testing_location)
   for item in items:
      item = item.lower()
      file_name, file_extension = os.path.splitext(item)
      if file_extension == extension:
         files_to_grade.append(os.path.join(testing_location, item))
   return files_to_grade

def clear_files(location):
   items = os.listdir(location)
   for item in items:
      os.remove(os.path.join(location, item))

def grade(file_to_grade, working_file_name, temp_directory, testing_file, testing_command, testing_options):

   print("Testing", file_to_grade)

   #copy over submission file to temporary workspace
   copy_to_path = os.path.join(temp_directory, working_file_name)
   shutil.copyfile(file_to_grade, copy_to_path)

   #copy over testing file to temporary workspace
   copy_to_path = os.path.join(temp_directory, testing_file)
   shutil.copyfile(testing_file, copy_to_path)

   #run test, capture results
   command_path = os.path.join(temp_directory, testing_command)
   result = subprocess.run([testing_command, testing_options, copy_to_path], stdout=subprocess.PIPE, shell=True)
   result = result.stdout.decode('utf-8').strip()
   
   #clear workspace directory
   clear_files(temp_directory)

   #return results
   return result

if __name__ == '__main__':
   submissions = get_files(SUBMISSION_DIRECTORY, FILE_EXTENSION)
   for submission in submissions:
      result = grade(submission, WORKING_FILE_NAME, WORKSPACE_DIRECTORY, TESTING_FILE, TESTING_COMMAND, TESTING_OPTIONS)