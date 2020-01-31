FROM acarteas/autograder-clang
COPY . /tmp/
WORKDIR /tmp/
RUN /clang_9.0.0/bin/clang++ -std=c++17 -o output *.cpp
#RUN ./output
CMD ["/bin/bash", "/tmp/run.sh"]

#command for auto cleanup and timeout: 
#docker run --rm <container> timeout 2 sh -c './output' 