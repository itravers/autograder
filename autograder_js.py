import os
import subprocess
import csv
import shutil
from autograder import Autograder

SUBMISSION_DIRECTORY = 'to_test'
WORKSPACE_DIRECTORY = 'temp'
RESULTS_DIRECTORY = 'results'
FILE_EXTENSION = list({'.html'})
TESTING_FILE = 'tester.js'
TESTING_COMMAND = 'testcafe'
TESTING_OPTIONS = 'chrome'
WORKING_FILE_NAME = 'pa1.html'


if __name__ == '__main__':

   grader = Autograder(FILE_EXTENSION, 
                       TESTING_FILE, 
                       TESTING_COMMAND,
                       TESTING_OPTIONS, 
                       WORKING_FILE_NAME
                       )
   grader.run()
      