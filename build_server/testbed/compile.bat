@ECHO OFF
CALL "C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\VC\Auxiliary\Build\"vcvars64.bat
CD "C:\TEMP"
cl.exe *.cpp /Femain.exe /EHsc /W4