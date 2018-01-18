# Challenge4

**Run as:** node ./interpreter.js the-code.txt


## Critics
The code’s efficiency could be improved mainly by taking advantage of NodeJS’s asynchronous event loop and avoid unnecessary blocking operations. For now, timeouts checks are hardcoded between lines’ processing and when reaching the end of the provided file. 
Of course, this could have been refined by implementing an event emitter (given the rules set out for this task). However, I felt that it would bring added complexity for a relatively simple task.

It’s also limited to what it can do, since only the 2 exemplified functions are supported.

