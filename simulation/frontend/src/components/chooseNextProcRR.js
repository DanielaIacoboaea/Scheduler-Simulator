
function chooseProc(currentIdx, procs, numProcs){
    let idx;
    
    for (let i = currentIdx + 1; i < numProcs; i++){
        if(procs[i].executed < procs[i].executionTime){
            idx = i;
            break;
        }
    }

    /*
        If no proc after the current one has time left from execution 
        Start searching a new proc from the beginning of the list
    */

    if(idx === undefined){
        idx = 0;
        while (procs[idx].executed === procs[idx].executionTime){
            idx++;
        }
    }
    return idx;
}

export default chooseProc;