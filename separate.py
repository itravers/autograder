import shutil
import subprocess
import os

items = os.listdir('to_test')
for item in items:
   name, ext = os.path.splitext(item)
   source = os.path.join('to_test', item)
   dest = os.path.join('to_test', name)
   os.mkdir(dest)
   print("copying", source, "to", dest)
   shutil.copy(source, dest)
