onmessage = function (e) {
    console.log('Message received from main script', e);
    var workerResult = 'Result: ';
    console.log('Posting message back to main script', workerResult);
    postMessage(workerResult);
}
