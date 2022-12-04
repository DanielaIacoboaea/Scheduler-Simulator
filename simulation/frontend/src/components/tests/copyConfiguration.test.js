import '@testing-library/jest-dom/extend-expect';
import { cleanup } from '@testing-library/react';
import copyConfiguration from "../copyConfiguration";

afterEach(cleanup);

describe("copies configuration of ongoing scheduling session", () => {
    it("should display the current configuration", () => {
        const general_settings = {
            "Slice": 2, 
            "Boost": 50, 
            "Queues": 3
        };
        const procs = [
            {
                "id": 0,
                "arrivalTime": 0,
                "executionTime": 15,
                "turnaround": 25,
                "response": 0,
                "color": "#9999CC",
                "executed": 15,
                "executedPercentage": 100.00000000000001,
                "percentage": 6.666666666666667,
                "startRunning": 0,
                "timeLeft": 0,
                "queueIdx": 2
            },
            {
                "id": 1,
                "arrivalTime": 1,
                "executionTime": 1,
                "turnaround": 1,
                "response": 1,
                "color": "#28A745",
                "executed": 1,
                "executedPercentage": 100,
                "percentage": 100,
                "startRunning": 2,
                "timeLeft": 0,
                "queueIdx": 0
            },
            {
                "id": 2,
                "arrivalTime": 1,
                "executionTime": 3,
                "turnaround": 14,
                "response": 3,
                "color": "#574240",
                "executed": 3,
                "executedPercentage": 100,
                "percentage": 33.333333333333336,
                "startRunning": 4,
                "timeLeft": 0,
                "queueIdx": 1
            },
            {
                "id": 3,
                "arrivalTime": 2,
                "executionTime": 2,
                "turnaround": 6,
                "response": 5,
                "color": "#C13470",
                "executed": 2,
                "executedPercentage": 100,
                "percentage": 50,
                "startRunning": 7,
                "timeLeft": 0,
                "queueIdx": 1
            },
            {
                "id": 4,
                "arrivalTime": 6,
                "executionTime": 3,
                "turnaround": 10,
                "response": 4,
                "color": "#8DAFCE",
                "executed": 3,
                "executedPercentage": 100,
                "percentage": 33.333333333333336,
                "startRunning": 10,
                "timeLeft": 0,
                "queueIdx": 1
            },
            {
                "id": 5,
                "arrivalTime": 8,
                "executionTime": 2,
                "turnaround": 5,
                "response": 4,
                "color": "#C13470",
                "executed": 2,
                "executedPercentage": 100,
                "percentage": 50,
                "startRunning": 12,
                "timeLeft": 0,
                "queueIdx": 1
            }
        ]
            
        const setup = `{"Procs":[{"id":0,"Arrival":0,"Execute":15},{"id":1,"Arrival":1,"Execute":1},{"id":2,"Arrival":1,"Execute":3},{"id":3,"Arrival":2,"Execute":2},{"id":4,"Arrival":6,"Execute":3},{"id":5,"Arrival":8,"Execute":2}],"Slice":2,"Boost":50,"Queues":3}`;
        expect(copyConfiguration(procs, general_settings)).toMatch(setup);
    });

    it("should display an error message", () => {
        const error = `{"Oops":"No processes available to copy. Start by adding at least one."}`;
        expect(copyConfiguration([], {})).toMatch(error);
    });
});