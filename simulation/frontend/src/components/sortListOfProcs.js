/*
    Sort a list of processes based on received parameters.
    E.g params: arrivalTime, executionTime, queueIdx;
*/

function sortProcs(procs, numParams, params){

    if(numParams === 1){

        let param1 = params["1"];
        procs.sort((a, b) => a[param1] - b[param1]);

    }else if (numParams === 2){
        let param1 = params["1"];
        let param2 = params["2"];
        procs.sort((a, b) => {
            if(a[param1] === b[param1]){
                return a[param2] - b[param2];
            }
            return a[param1] - b[param1];
        });
    }
    return procs.slice();
}

export default sortProcs;