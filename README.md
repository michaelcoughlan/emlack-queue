# Promise Queue

Promise Queue is a package to execute an array of Promises in order. The Queue will wait until the current Promise is resolved before moving on to the next item.

## Usage

```javascript
const PromiseQueue = require('./src');

const isQueueStoppedByError = false;
const q = new PromiseQueue(isQueueStoppedByError);

q.add('job-1', () => new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(1);
    }, 1000);
}));

q.add('job-2', () => new Promise((resolve, reject) => {
    resolve(2);
}));

q.add('job-3', () => new Promise((resolve, reject) => {
    resolve(3);
}));

q.start()
    .then(res => console.log(res))
    .catch(error => console.log('ERROR IN QUEUE', error));
```
