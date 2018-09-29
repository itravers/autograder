import os
import subprocess
import csv
import shutil
from enum import Enum
from .tester import Tester

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
      self._testing_options = testing_options
      self._working_file_name = working_file_name
      self._submission_directory = submission_directory
      self._workspace_directory = workspace_directory
      self._results_directory = results_directory
      self._verbosity = verbosity
   
   def _copy_file(self, source, dest):
      try:
         shutil.copyfile(source, dest)
         return 0
      except:
         if self._verbosity == OutputLevel.VERBOSE:
            print("Could not locate file", source)
            return -1

   def _get_files(self, base_path = None):

      submission_dir = self._submission_directory
      if(base_path != None):
         submission_dir = base_path
      
      if os.path.exists(submission_dir) == False:
         os.mkdir(submission_dir)

      files_to_grade = list()
      items = os.listdir(submission_dir)
      for item in items:
         item = item.lower()
         full_path = os.path.join(submission_dir, item)

         #ignore hidden folders
         if item[0] == '.':
               continue
         
         #if directory, do a recursive call to find more files
         if os.path.isdir(full_path):
            sub_dirs = self._get_files(full_path)
            for sub_item in sub_dirs:
               files_to_grade.append(sub_item)
         else:
            file_name, file_extension = os.path.splitext(item)
            if file_extension in self._file_extensions:

               if self._verbosity == OutputLevel.VERBOSE:
                  print("Found", file_name, "to grade.")

               files_to_grade.append(full_path)
      return files_to_grade

   #deletes all files in the specified location
   def _clear_files(self, location):
      items = os.listdir(location)
      for item in items:
         os.remove(os.path.join(location, item))

   #performs the grading of a single assignment
   def _grade(self, file_to_grade):

      if os.path.exists(self._workspace_directory) == False:
         os.mkdir(self._workspace_directory)

      if self._verbosity == OutputLevel.VERBOSE:
         print("Testing", file_to_grade)

      #copy over submission file to temporary workspace
      if len(file_to_grade) > 0:
         copy_to_path = os.path.join(self._workspace_directory, self._working_file_name)
         shutil.copyfile(file_to_grade, copy_to_path)

      #copy over testing file to temporary workspace
      if isinstance(self._testing_file, list):
         for item in self._testing_file:
            copy_to_path = os.path.join(self._workspace_directory, item)
            if self._copy_file(item, copy_to_path) != 0:
               return ""
      elif len(self._testing_file) > 0:
         copy_to_path = os.path.join(self._workspace_directory, self._testing_file)
         if self._copy_file(self._testing_file, copy_to_path) != 0:
               return ""

      #run test, capture results
      result = ""
      if callable(self._testing_command):
         result = self._testing_command()
      elif isinstance(self._testing_command, Tester):
         self._testing_command.test()
      else:
         command_path = os.path.join(self._workspace_directory, self._testing_command)
         result = subprocess.run([self._testing_command, self._testing_options, copy_to_path], stdout=subprocess.PIPE, shell=True)
         result = result.stdout.decode('utf-8').strip()
      
      #clear workspace directory
      self._clear_files(self._workspace_directory)

      #return results
      return result

   #runs the auto grader
   def run(self):
      submissions = self._get_files()
      for submission in submissions:
         result = self._grade(submission)
         file_name, file_extension = os.path.splitext(submission)
         file_name = os.path.split(file_name)
         file_name = file_name[-1]
         output = open(os.path.join(self._results_directory, file_name + '.txt'), 'w', encoding="utf-8")
         print(result, file=output)
         output.close()

