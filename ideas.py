'''
This was my original auto grading scrip that I wrote 3+ years ago.  
It probably is in need of a massive update (and will get one soon). 
Adding to the repository as-is for now.
'''
import subprocess
import os
import shutil
import difflib
import csv
import time

def find_file(root_dir, file_name):

    #get all items in directory (could be file or dir)
    items = os.listdir(root_dir)

    #split into directories
    directories = list()
    for item in items:

        #ignore hidden VS folders
        if item[0] == '.':
            continue

        path = os.path.join(root_dir, item)

        #is directory? Remember for later
        if os.path.isdir(path):
            directories.append(path)
        else:

            #is this what we're looking for?
            if file_name == item:
                return path

    #search sub directories
    for directory in directories:
        result = find_file(directory, file_name)
        if len(result) > 0:
            return result

    #not found?  Return empty
    return ""
        

#build tools settings
compiler_path = r'C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\bin'
compiler_exe = 'cl.exe'
compiler_command = '"' + os.path.join(compiler_path, compiler_exe) + '"'

#Master project settings.  The master project is what student's solutions will
#get copied into 
master_project_path = 'master'
master_project_build_file = 'main.cpp'
master_project_exe = 'main.exe'
master_output_file = 'output.txt'
build_path = os.path.join(master_project_path, master_project_build_file)
exe_path = os.path.join(master_project_path, master_project_exe)

#Student project settings.
submission_path = os.path.dirname(os.path.realpath(__file__))
submission_path = os.path.join(submission_path, 'submissions')
submission_results = dict()
failed_builds = list()
student_times = dict()

#specifies which files we will be copying over from the student's submission
files_to_copy = ['Graph.h']

#build master project, capture output for later use
try:
    #print("building", build_path)
    subprocess.check_output(compiler_command + " " + build_path + " /EHsc")
except:
    pass

#capture master output
#print("running", exe_path)
master_result = subprocess.check_output(master_project_exe).decode('utf-8')
print(master_result)

#find necessary files in master solution
master_files = []
for to_find in files_to_copy:
    master_files.append(find_file(master_project_path, to_find))

#make copies to so that we can revert after running script
for file in master_files:
    print("making copy of", file)
    shutil.copyfile(file, file + ".copy")

#loop through student solutions
submission_dirs = os.listdir(submission_path)
for submission_dir in submission_dirs:
    print("Processing", submission_dir)
    student_dir = os.path.join(submission_path, submission_dir)
    
    #search for necessary files in student solution
    files = []
    for to_find in files_to_copy:
        found = find_file(student_dir, to_find)
        if len(found) > 0:
            files.append(found)

    #no files found
    if len(files) != len(files_to_copy) or len(files) == 0:
        print("Failed to compile project\n")
        failed_builds.append(submission_dir)
        continue

    #copy files to master project
    for i in range(len(files)):
        print("copying", files[i], "to", master_files[i])
        shutil.copyfile(files[i], master_files[i])

    #remove old EXE (might not exist)
    try:
        os.remove(master_project_exe)
    except:
        pass

    #compile master project again with new files
    try:
        subprocess.check_output(compiler_command + " " + build_path + " /EHsc").decode()
        start = time.clock()
        submission_results[submission_dir] = subprocess.check_output(master_project_exe).decode('utf-8')
        end = time.clock()

        #record run time for student project
        student_times[submission_dir] = end - start;
    except:
        print("Failed to compile project\n")
        failed_builds.append(submission_dir)
        student_times[submission_dir] = -1;
    #print(submission_results[submission_dir])

    #copy over output files
    student_dir = os.path.join('results', submission_dir)
    if os.path.exists(student_dir) == False:
        os.mkdir(student_dir)
    if submission_dir in submission_results:
        raw_output = os.path.join(student_dir, 'console output.txt')
        raw_file = open(raw_output, 'w')
        print(submission_results[submission_dir], file=raw_file)
        raw_file.close();

#diff results to assign scores
differ = difflib.Differ()
master_pieces = master_result.split('\n')
diff_stats = dict()
for student in submission_results:
    student_pieces = submission_results[student].split('\n')
    diff_result = list(differ.compare(master_pieces, student_pieces))

    #compare results, count misses
    misses = 0
    for i in range(len(diff_result)):
        if diff_result[i][0] == '+' or diff_result[i][0] == '-':
            misses += 1
    
    #remember misses
    diff_stats[student] = misses;

#revert changes in master copy
for file in master_files:
    shutil.copyfile(file + ".copy" , file)

#write results to CSV
output_file = open('results.csv', 'w', newline='')
csv_writer = csv.writer(output_file, delimiter=',', quotechar='"')
for student in diff_stats:
    row = [student, diff_stats[student]] #('"', student, '",', diff_stats[student], sep="")
    csv_writer.writerow(row)
output_file.close()

#write times to file
output_file = open('times.csv', 'w', newline='')
csv_writer = csv.writer(output_file, delimiter=',', quotechar='"')
for student in student_times:
    row = [student, student_times[student]] #('"', student, '",', diff_stats[student], sep="")
    csv_writer.writerow(row)
output_file.close()

output_file = open('errors.csv', 'w', newline='')
csv_writer = csv.writer(output_file, delimiter=',', quotechar='"')
for student in failed_builds:
    row = [student]
    csv_writer.writerow(row)
output_file.close()