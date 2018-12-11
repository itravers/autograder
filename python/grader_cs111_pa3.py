import os
import subprocess
import csv
import shutil
from autograder import autograder

SUBMISSION_DIRECTORY = 'to_test'
WORKSPACE_DIRECTORY = 'temp'
RESULTS_DIRECTORY = 'results'
FILE_EXTENSION = list({'.html'})

#AC Note: last file must be file that will be run by testcafe
TESTING_FILE = ['tiny-turtle.js', 'tester.js']
TESTING_COMMAND = 'testcafe'
TESTING_OPTIONS = 'chrome'
WORKING_FILE_NAME = 'pa3.html'


if __name__ == '__main__':

   grader = Autograder(FILE_EXTENSION, 
                       TESTING_FILE, 
                       TESTING_COMMAND,
                       TESTING_OPTIONS, 
                       WORKING_FILE_NAME
                       )
   grader.run()
      