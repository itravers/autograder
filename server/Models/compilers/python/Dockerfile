FROM itravers/autograder-python
COPY . /tmp/
WORKDIR /tmp/
RUN /usr/local/bin/python *.py > output.txt
CMD ["/bin/cat", "/tmp/output.txt"]

#command for auto cleanup and timeout: 
#docker run --rm <container> timeout 2 sh -c './output'