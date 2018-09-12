import os
import subprocess
import csv
import shutil
from enum import Enum

class OutputLevel(Enum):
   VERBOSE = 1
   QUIET = 2 

class Autograder:

   def __init__(self,
                file_extensions,
                testing_file,
                testing_command,
                testing_options,
                working_file_name,
                submission_directory = 'to_test',
                workspace_directory = 'temp',
                results_directory = 'results',
                verbosity = OutputLevel.VERBOSE
                ):
      self._file_extensions = file_extensions
      self._testing_file = testing_file
      self._testing_command = testing_command
      self._self._testing_options = testing_options
      self._working_file_name = working_file_name
      self._submission_directory = submission_directory
      self._workspace_directory = workspace_directory
      self._results_directory = results_directory
      self._verbosity = verbosity
      
   def __get_files(self, extensions):

      if os.path.exists(self._testing_location) == False:
         os.mkdir(self._testing_location)

      files_to_grade = list()
      items = os.listdir(self._testing_location)
      for item in items:
         item = item.lower()
         full_path = os.path.join(self._testing_location, item)

         #ignore hidden folders
         if item[0] == '.':
               continue
         
         #if directory, do a recursive call to find more files
         if os.path.isdir(item):
            files_to_grade.append(get_files(full_path, self._extensions))
         elif:
            file_name, file_extension = os.path.splitext(item)
            if file_extension in _extensions:
               files_to_grade.append(full_path, item))
      return files_to_grade

   #deletes all files in the specified location
   def __clear_files(self, location):
      items = os.listdir(location)
      for item in items:
         os.remove(os.path.join(location, item))

   #performs the grading of a single assignment
   def __grade(self, file_to_grade):

      if os.path.exists(self._temp_directory) == False:
         os.mkdir(self._temp_directory)

      if self._verbosity == OutputLevel.VERBOSE:
         print("Testing", file_to_grade)

      #copy over submission file to temporary workspace
      copy_to_path = os.path.join(self._temp_directory, self._working_file_name)
      shutil.copyfile(file_to_grade, copy_to_path)

      #copy over testing file to temporary workspace
      copy_to_path = os.path.join(self._temp_directory, self._testing_file)
      shutil.copyfile(self._testing_file, copy_to_path)

      #run test, capture results
      command_path = os.path.join(self._temp_directory, self._testing_command)
      result = subprocess.run([self._testing_command, self._testing_options, copy_to_path], stdout=subprocess.PIPE, shell=True)
      result = result.stdout.decode('utf-8').strip()
      
      #clear workspace directory
      self.__clear_files(self._temp_directory)

      #return results
      return result

   #runs the auto grader
   def run(self):
      submissions = self.__get_files()
      for submission in submissions:
         result = grade(submission)
         file_name, file_extension = os.path.splitext(submission)
         file_name = os.path.split(file_name)
         file_name = file_name[-1]
         output = open(os.path.join(self._results_directory, file_name + '.txt'), 'w', encoding="utf-8")
         print(result, file=output)
         output.close()

class CppAutograder(Autograder):
   def run(self):
      