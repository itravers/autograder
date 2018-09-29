from .autograder import *
from .tester import *

#home pc tools location: E:\Program Files (x86)\Microsoft Visual Studio\2017\Enterprise\VC\Tools\MSVC\14.15.26726\bin\Hostx86\x86
#laptop tools location: C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\VC\Tools\MSVC\14.14.26428\bin\Hostx86\x86
#work tools location: C:\Program Files (x86)\Microsoft Visual Studio\2017\Enterprise\VC\Tools\MSVC\14.14.26428\bin\Hostx86\x86
class CppAutograder(Autograder):

   def __init__(self,
                file_extensions,
                testing_file,
                testing_command,
                testing_options,
                working_file_name,
                
                submission_directory = 'to_test',
                workspace_directory = 'temp',
                results_directory = 'results',
                verbosity = OutputLevel.VERBOSE,
                output_exe_name = 'temp/main.exe',
                build_tools_path = r'E:\Program Files (x86)\Microsoft Visual Studio\2017\Enterprise\VC\Tools\MSVC\14.15.26726\bin\Hostx86\x86',
                build_tools_exe = 'cl.exe',
                ):
      super().__init__(file_extensions,
                testing_file,
                testing_command,
                testing_options,
                working_file_name,
                submission_directory,
                workspace_directory,
                results_directory,
                verbosity = OutputLevel.VERBOSE)
      self._output_exe_name = output_exe_name
      self._build_tools_path = build_tools_path
      self._build_tools_exe = build_tools_exe
   
   def run(self):

      #stores location of each student code folder
      student_folders = dict()

      #Find all .cpp files
      submissons = self._get_files()
      for submission in submissons:

         #it is possible that many .cpp files belong to a single 
         #project.  Therefore, we have to group projects by unique folders
         directory = os.path.dirname(submission)
         student_folders[directory] = directory
      
      #Now, we can compile each directory
      compiler_command = '"' + os.path.join(self._build_tools_path, self._build_tools_exe) + '"'
      for directory in student_folders:
         normed_path = os.path.normpath(directory)
         pieces = normed_path.split(os.sep)
         author = pieces[1]

         #testing command should be of type Tester, which allows us to configure final destination properties
         if isinstance(self._testing_command, Tester):
            
            self._testing_command.author = author

         #remove previous main.exe
         if os.path.isfile(self._output_exe_name) == True:
            os.remove(self._output_exe_name)
         
         if self._verbosity == OutputLevel.VERBOSE:
            print("attempting to compile files in", directory)

         command = compiler_command + " \"" + directory + "\*.cpp\" /EHsc /Fe" + self._output_exe_name
         result = ""
         try:
            result = subprocess.check_output(command).decode('utf-8')
            if self._verbosity == OutputLevel.VERBOSE:
               print(result)
         except:

            #log compilation failure for later inspection
            '''
            log_path = os.path.join(self._results_directory, author + ".txt")
            with open(log_path, 'w') as log_file:

               #at present, does not output text.  Need to fix.
               print(result, file=log_file)
            '''

            if self._verbosity == OutputLevel.VERBOSE:
               print("Failed to compile project using command:\n", command)

         #only run if we compiled correctly
         if len(result) > 0:
            pass

         self._grade("")
 