import os
import subprocess
import csv
import shutil
from autograder import Autograder

SUBMISSION_DIRECTORY = 'to_test'
WORKSPACE_DIRECTORY = 'temp'
RESULTS_DIRECTORY = 'results'
FILE_EXTENSION = list({'.cpp', '.h'})
TESTING_FILE = 'cpp_tester.py'
TESTING_COMMAND = './cpp_tester.py'
TESTING_OPTIONS = 'chrome'
WORKING_FILE_NAME = 'pa1.html'


'''
Agenda:
   Find location of cpp file, run cl on that folder location.  Save output as studentName.exe
   For each test case:
      Run program on test case, capture results
'''

if __name__ == '__main__':

   grader = Autograder(FILE_EXTENSION, 
                       TESTING_FILE, 
                       TESTING_COMMAND,
                       TESTING_OPTIONS, 
                       WORKING_FILE_NAME
                       )
   grader.run()
      