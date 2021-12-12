# Promise Queue

Promise Queue is a package to execute an array of Promises in order. The Queue will wait until the current Promise is resolved before moving on to the next item.

## Usage

```javascript
const { PromiseQueue } = require('.');

// Initialize the PromiseQueue
const queue = new PromiseQueue();

// Add jobs to the queue
queue.add('job-1', () => new Promise((resolve) => {
    setTimeout(() => {
        resolve('Job 1 complete')
    }, 2500);
}));

queue.add('job-2', () => new Promise((resolve) => {
    resolve('Job 2 complete');
}));

queue.add('job-3', () => new Promise((resolve, reject) => {
    reject('Job 3 complete');
}));

// Start the queue execution
queue.start()
    .then((queueResults) => {
        // Handle queue results
        console.log(queueResults);
    })
    .catch((error) => {
        // Handle errors from the queue
        console.log(error);
    });
```
