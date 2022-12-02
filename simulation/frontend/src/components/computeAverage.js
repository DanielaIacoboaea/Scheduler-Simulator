/*
    Compute average Turnaround Time or average Response Time 
    for a list of completed processes.
*/
function getAverage(procs, type){

    let avg = 0;

    for (let proc in procs){
        avg += procs[proc][type];
    }

    avg = avg/procs.length;
    
    return avg;
}

export default getAverage;