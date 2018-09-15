from autograder import *

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
                output_exe_name = 'main.exe',
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
      '''
      Agenda:
      Find location of cpp file, run cl on that folder location.  Save output as studentName.exe
      For each test case:
            Run program on test case, capture results
      '''

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
         
         if self._verbosity == OutputLevel.VERBOSE:
            print("attempting to compile files in", directory)

         command = compiler_command + " " + directory + "\*.cpp /EHsc /Fetemp/main.exe"
         result = ""
         #result = subprocess.run([compiler_command], stdout=subprocess.PIPE, shell=True)
         #result = result.stdout.decode('utf-8').strip()

         try:
            result = subprocess.check_output(command).decode('utf-8')
            if self._verbosity == OutputLevel.VERBOSE:
               print(result)
         except:
            if self._verbosity == OutputLevel.VERBOSE:
               print("Failed to compile project\n")

         #only run if we compiled correctly
         if len(result) > 0:
            pass
         self._grade("")
