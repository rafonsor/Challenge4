# Challenge4

**Run as:** node ./interpreter.js the-code.txt


## Critics
The code’s efficiency could be improved mainly by taking advantage of NodeJS’s asynchronous event loop and avoid unnecessary blocking operations. For now, timeouts checks are hardcoded between each read line (slowing therefore their processing) and when reached the end of the provided file, blocking until completion.
Of course, this could be refined by implementing an event emitter (given the rules set out for this task). However, I felt that it would bring added complexity, unneeded for a relatively narrow task.

Also, i kept timeouts on an unsorted queue, because i wanted to reduce the overhead caused by processing each line. During timeout check, for each i called Date.now(), to anticipate longer callbacks, but i know that it is less efficient if they're only calling the console.log function or another simple function.

It’s also limited to what it can do, since its not a general interpreter and only the 2 exemplified functions are supported.

