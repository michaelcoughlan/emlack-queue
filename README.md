# Promise Qu

Promise Qu uses recursion to sequentially execute an array of Promises. The queue will wait until the current Promise is resolved before moving on to the next item.

## Why use Promise Qu?

If you have an array of Promises that need to wait for the previous one to resolve before continuing.

## Usage

In order to set up a basic queue you can use the following code snippet. In the example below a new queue instance is created and Promise jobs are pushed to the queue. Although there is a `setTimeout` in the first job, it will wait for this to finish before moving on to `job-2` and `job-3`.

`add(() => ...)` will push a Promise to the queue.

`start()` will begin the execution of each job in the queue, this returns a Promise.

```javascript
const PromiseQu = require('./src');

const isQueueStoppedByError = false;
const q = new PromiseQu(isQueueStoppedByError);

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

Each job has the following structure:

```json
{
    "key": "job-1",
    "job": "<YOUR_FUNCTION>",
    "status": "<ERROR | NOT_STARTED | PENDING | SUCCESS>"
}
```

The flag `isQueueStoppedByError` will stop the Queue from continuing to execute if it is set to `true`. If `false` it will continue on and push the error to an `errors` array to view once everything is complete. The end response will look like:

```json
{
    "errors": [
        {
            "result": 1,
            "key": "job-1",
            "status": "ERROR"
        }
    ],
    "success": [
        {
            "key": "job-2",
            "result": 2,
            "status": "SUCCESS"
        },
        {
            "key": "job-3",
            "result": 3,
            "status": "SUCCESS"
        }
    ]
}
```