import os
import subprocess
import csv
import shutil
from cpp_autograder import CppAutograder
import pa1_tester

SUBMISSION_DIRECTORY = 'to_test'
WORKSPACE_DIRECTORY = 'temp'
RESULTS_DIRECTORY = 'results'
FILE_EXTENSION = list({'.cpp'})
TESTING_FILE = 'main.exe'
TESTING_COMMAND = pa1_tester.test
TESTING_OPTIONS = ''
WORKING_FILE_NAME = ''


'''
Agenda:
   Find location of cpp file, run cl on that folder location.  Save output as studentName.exe
   For each test case:
      Run program on test case, capture results
'''

if __name__ == '__main__':

   grader = CppAutograder(FILE_EXTENSION, 
                       TESTING_FILE, 
                       TESTING_COMMAND,
                       TESTING_OPTIONS, 
                       WORKING_FILE_NAME
                       )
   grader.run()
      