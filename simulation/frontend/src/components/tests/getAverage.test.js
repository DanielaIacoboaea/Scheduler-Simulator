import '@testing-library/jest-dom/extend-expect';
import { cleanup } from '@testing-library/react';
import getAverage from "../computeAverage";

afterEach(cleanup);

it("computes average turnaround and response time for a scheduling session", () => {
    const procs = [
        {
            "id": 0,
            "arrivalTime": 0,
            "executionTime": 3,
            "turnaround": 2,
            "response": 0,
            "color": "#93B725",
            "executed": 3,
            "executedPercentage": 100,
            "percentage": 33.333333333333336,
            "startRunning": 0,
            "timeLeft": 0
        },
        {
            "id": 1,
            "arrivalTime": 0,
            "executionTime": 3,
            "turnaround": 5,
            "response": 3,
            "color": "#E19894",
            "executed": 3,
            "executedPercentage": 100,
            "percentage": 33.333333333333336,
            "startRunning": 3,
            "timeLeft": 0
        },
        {
            "id": 2,
            "arrivalTime": 0,
            "executionTime": 3,
            "turnaround": 8,
            "response": 6,
            "color": "#4C7D93",
            "executed": 3,
            "executedPercentage": 100,
            "percentage": 33.333333333333336,
            "startRunning": 6,
            "timeLeft": 0
        }
    ]
    expect(getAverage(procs, "turnaround")).toBe(5.00);
    expect(getAverage(procs, "response")).toBe(3.00);
});