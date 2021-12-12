const { PromiseQueue } = require('./');

describe('Testing PromiseQueue functionality', () => {
    let promiseQueue;

    beforeEach(() => {
        promiseQueue = new PromiseQueue();
    });

    test('that the PromiseQueue class is initialized without error', () => {
        expect(promiseQueue).toBeDefined();
    });

    test('that jobs are added to the queue', () => {
        promiseQueue.add('job-1', () => new Promise(resolve => resolve(1)));
        promiseQueue.add('job-2', () => new Promise(resolve => resolve(2)));
        promiseQueue.add('job-3', () => new Promise(resolve => resolve(3)));

        expect(promiseQueue.queue.length).toBe(3);
    });

    test('that the queue is cleared of all jobs', () => {
        promiseQueue.add('job-1', () => new Promise(resolve => resolve(1)));
        promiseQueue.add('job-2', () => new Promise(resolve => resolve(2)));
        promiseQueue.add('job-3', () => new Promise(resolve => resolve(3)));

        expect(promiseQueue.queue.length).toBe(3);

        promiseQueue.resetQueue();

        expect(promiseQueue.queue.length).toBe(0);
    });

    test('the promises get executed in the correct order', () => {
        promiseQueue.add('job-1', () => new Promise((resolve) => {
            setTimeout(() => {
                resolve(1);
            }, 500);
        }));

        promiseQueue.add('job-2', () => new Promise(resolve => resolve(2)));

        return promiseQueue.start()
            .then((queueResult) => {
                expect(queueResult.success[0].result).toBe(1);
                expect(queueResult.success[1].result).toBe(2);
                expect(queueResult.errors.length).toBe(0);
            });
    });

    test('the correct error response when all jobs fail', () => {
        promiseQueue.add('job-1', () => new Promise((resolve, reject) => reject(1)));

        return promiseQueue.start()
            .then(() => {})
            .catch((error) => {
                expect(error.code).toBe(500);
                expect(error.data).toEqual([{ key: 'job-1', error: 1 }]);
                expect(error.message).toBe('All jobs in the PromiseQueue failed.');
            });
    });
});
