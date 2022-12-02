function deleteEntry(procs, procId){

    let idxToDelete;
    
    for (let i = 0; i < procs.length; i++){
        if (procs[i].id === parseInt(procId)){
            idxToDelete = i;
        }
    }

    let procsBefore = procs.slice(0, idxToDelete);
    let procsAfter = procs.slice(idxToDelete + 1, procs.length);
    let newProcs = procsBefore.concat(procsAfter);
    let newTotalExecutionTime = 0;

    for (let i = 0; i < newProcs.length; i++){
        newTotalExecutionTime += newProcs[i].executionTime;
    }

    return {
        "updateProcs": newProcs,
        "updateTotalExecTime": newTotalExecutionTime
    }
}

export default deleteEntry;