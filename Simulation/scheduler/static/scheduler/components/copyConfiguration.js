/*
    Add current configuration for the scheduler:
    - processes
    - Time Slice - if available
    - Queues - if available 
    - Boost - if available
    And return a JSON with these settings
 */

function copyConfiguration(procs, general_settings){
    let conf = {"Procs": []};

    if(procs.length >= 1){

        for(let proc in procs){
            conf["Procs"].push({
                "id": procs[proc].id, 
                "Arrival": procs[proc].arrivalTime, 
                "Execute": procs[proc].executionTime
            });
        }
        if(general_settings){
            for(let setting in general_settings){
                conf[setting] = general_settings[setting];
            }
        }
    }else{
        return JSON.stringify({"Oops": "No processes available to copy. Start by adding at least one."})
    }
    
    return JSON.stringify(conf);
}

export default copyConfiguration;