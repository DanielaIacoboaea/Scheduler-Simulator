import React from "react";
import '@testing-library/jest-dom/extend-expect';
import { render, cleanup } from '@testing-library/react';
import ProgressBar from "../progressBar";

afterEach(cleanup);

describe("render progress bar for process of length 4", () => {
    it("it starts with width 0 and increases progress up to 100%", () => {
    const proc_length = 4;
    let barWidth = 0;

    for (let i = 0; i < proc_length; i++){
        barWidth = barWidth + (100 / proc_length);
        const bar = render(<ProgressBar  barWidth={barWidth}
            ariaValuenow={`${barWidth}%`}
            barColor="#dc3545"
            procId="0"/>);

        const progress = bar.getByText(`P0 : ${barWidth}%`, {
        selector: 'div',
        });

        expect(progress).toBeDefined();
    }});
});
