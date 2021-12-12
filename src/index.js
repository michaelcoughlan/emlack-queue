const { PENDING } = require('./constants');

class PromiseQueue {
    errors = [];
    queue = [];
    queueIndex = 0;
    results = [];

    /**
     * Push a new job to the queue
     *
     * @param {string} key the name of the queue item
     * @param {function} job the function to be executed
     * @returns {Void}
     *
     * @author Michael Coughlan
     */
    add(key, job) {
        this.queue.push({
            job,
            key,
            status: PENDING,
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
                            message: 'All jobs in the PromiseQueue failed.',
                        });
                    }

                    resolve({
                        errors: this.errors,
                        success: this.results,
                    });
                });
            });
    }

    /**
     * Recursively execute the jobs from the queue. When the index is greater
     * than the queue length the job will be undefined and will resolve the
     * original promise in start().
     *
     * @param {object} queueJob the promise to be executed
     * @returns {Promise}
     *
     * @author Michael Coughlan
     */
    executeJob(queueJob) {
        return new Promise((resolve) => {
            if (!this.queue[this.queueIndex]) {
                resolve();
            }

            queueJob.job()
                .then((result) => {
                    this.results.push({
                        key: queueJob.key,
                        result,
                    });

                    this.queueIndex += 1;
                    this.executeJob(this.queue[this.queueIndex]).then(() => resolve());
                })
                .catch((error) => {
                    this.errors.push({
                        error,
                        key: queueJob.key,
                    });

                    resolve(error);
                });
        });
    }

    /**
     * Reset everything in the queue
     *
     * @author Michael Coughlan
     */
    resetQueue() {
        this.errors = [];
        this.results = [];
        this.queue = [];
        this.queueIndex = 0;
    }
}

module.exports = { PromiseQueue };
