
function updateQueues(procs, numQueues){
    let updateQueue = [];
    for (let i = 0; i < numQueues; i++){
        updateQueue[i] = [];
    }

    for (let i = 0; i < procs.length; i++){
        let idx = procs[i].queueIdx;
        updateQueue[idx].push(procs[i]);
    }
    return updateQueue;
}

export default updateQueues;