# escape=`

# Use the latest Windows Server Core image with .NET Framework 4.7.1.
FROM microsoft/nanoserver

# Restore the default Windows shell for correct batch processing.
SHELL ["cmd", "/S", "/C"]

WORKDIR /TEMP

COPY . /TEMP

CMD ["run.bat"]