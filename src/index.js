const { ERROR, NOT_STARTED, PENDING, SUCCESS } = require('./constants');

class Queue {
    errors = [];
    isQueueStoppedByError = false;
    queue = [];
    queueIndex = 0;
    results = [];

    constructor(isQueueStoppedByError = false) {
        this.isQueueStoppedByError = isQueueStoppedByError;
    }

    /**
     * Add a new job to the queue
     *
     * @param {string} key the name of the queue item
     * @param {function} job the function to be executed
     * @returns {void}
     *
     * @author Michael Coughlan
     */
    add(key, job) {
        this.queue.push({
            job,
            key,
            status: NOT_STARTED,
        });
    }

    /**
     * Begin to sequentially run each job in the queue
     *
     * @returns {Promise}
     *
     * @author Michael Coughlan
     */
    start() {
        return new Promise((resolve, reject) => {
            const initialJob = this.queue[this.queueIndex];

            this.executeJob(initialJob)
                .then(() => {
                    if (this.results.length === 0 && this.errors.length > 0) {
                        reject({
                            code: 500,
                            data: this.errors,
                            message: 'All jobs in the Queue failed.',
                        });
                    }

                    resolve({
                        errors: this.errors,
                        success: this.results,
                    });
                })
                .catch((err) => reject(err));
            });
    }

    /**
     * Recursively execute the jobs from the queue. When the index is greater
     * than the queue length the job will be undefined and will resolve the
     * original promise in start().
     *
     * @param {object} queueJob the promise to be executed
     * @returns {promise}
     *
     * @author Michael Coughlan
     */
    executeJob(queueJob) {
        return new Promise((resolve, reject) => {
            if (!this.queue[this.queueIndex]) {
                resolve();
            }

            queueJob.status = PENDING;
            queueJob.job()
                .then((result) => {
                    queueJob.status = SUCCESS;

                    this.results.push({
                        key: queueJob.key,
                        result,
                        status: queueJob.status,
                    });

                    this.queueIndex += 1;
                    this.executeJob(this.queue[this.queueIndex])
                        .then(() => resolve())
                        .catch((err) => reject(err));
                })
                .catch((error) => {
                    queueJob.status = ERROR;

                    this.errors.push({
                        result: error,
                        key: queueJob.key,
                        status: queueJob.status,
                    });

                    if (this.isQueueStoppedByError) {
                        return reject({
                            code: 500,
                            message: 'Queue stopped due to error.',
                            error,
                            data: {
                                errors: this.errors,
                                success: this.results,
                            }
                        });
                    }

                    this.queueIndex += 1;
                    this.executeJob(this.queue[this.queueIndex])
                        .then(() => resolve())
                        .catch((err) => reject(err));
                });
        });
    }

    /**
     * Reset everything in the queue
     *
     * @returns {void}
     *
     * @author Michael Coughlan
     */
    resetQueue() {
        this.errors = [];
        this.isQueueStoppedByError = false;
        this.results = [];
        this.queue = [];
        this.queueIndex = 0;
    }
}

module.exports = Queue;
