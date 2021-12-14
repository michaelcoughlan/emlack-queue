const PromiseQu = require('./');

describe('Testing PromiseQu functionality', () => {
    let q;

    beforeEach(() => {
        q = new PromiseQu();
    });

    test('that the queue class is initialized without error', () => {
        expect(q).toBeDefined();
    });

    test('that jobs are added to the queue', () => {
        q.add('job-1', () => new Promise(resolve => resolve(1)));
        q.add('job-2', () => new Promise(resolve => resolve(2)));
        q.add('job-3', () => new Promise(resolve => resolve(3)));

        expect(q.queue.length).toBe(3);
    });

    test('that the queue is cleared of all jobs', () => {
        q.add('job-1', () => new Promise(resolve => resolve(1)));
        q.add('job-2', () => new Promise(resolve => resolve(2)));
        q.add('job-3', () => new Promise(resolve => resolve(3)));

        expect(q.queue.length).toBe(3);

        q.resetQueue();

        expect(q.queue.length).toBe(0);
    });

    test('the promises get executed in the correct order', () => {
        q.add('job-1', () => new Promise((resolve) => {
            setTimeout(() => {
                resolve(1);
            }, 500);
        }));

        q.add('job-2', () => new Promise(resolve => resolve(2)));

        return q.start()
            .then((queueResult) => {
                expect(queueResult.success[0].result).toBe(1);
                expect(queueResult.success[1].result).toBe(2);
                expect(queueResult.errors.length).toBe(0);
            });
    });

    test('the queue ends when the flag is enabled', () => {
        q.isQueueStoppedByError = true;

        q.add('job-1', () => new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(1);
            }, 1000);
        }));

        return q.start()
            .then(() => {})
            .catch((error) => {
                expect(error.code).toBe(500);
                expect(error.message).toBe('Queue stopped due to error.');
                expect(error.data).toEqual({
                    errors: [{
                        key: 'job-1',
                        result: 1,
                        status: 'ERROR',
                    }],
                    success: [],
                });
            });
    });

    test('the correct error response when all jobs fail', () => {
        q.add('job-1', () => new Promise((resolve, reject) => reject(1)));

        return q.start()
            .then(() => {})
            .catch((error) => {
                expect(error.code).toBe(500);
                expect(error.data).toEqual([{ key: 'job-1', result: 1, status: 'ERROR' }]);
                expect(error.message).toBe('All jobs in the Queue failed.');
            });
    });
});
