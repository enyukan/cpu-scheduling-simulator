import { Chart, registerables } from "chart.js";
import React, { useEffect, useRef } from "react";

// Register to use modules in charts
Chart.register(...registerables);

// Pie Chart Component (We need info about 'processes', 'executionProgress' to draw or update the chart)
const PieChart = ({ processes, execProgress }) => {

    // Space for drawing chart
    const chartRef = useRef(null);

    // Chart object
    const chart = useRef(null);

    // Execute the following code every time the value of processes or execProgress changes
    useEffect(() => {

        if (!chartRef.current) return;

        // ctx is like pencil. We are going to draw chart with the obj 'ctx'
        const ctx = chartRef.current.getContext("2d");

        // Calculate total burst time for all processes
        const totalBurst = processes.reduce((acc, p) => acc + p.initialBurst, 0);

        // Convert the execution progress of each process to percentage (Array)
        let execPercentages = processes.map((p) => ((p.initialBurst - p.burstTime) / totalBurst) * 100);

        // Total cumulative progress
        const execSum = execPercentages.reduce((acc, val) => acc + val, 0);

        // Current run rate for each process
        execPercentages.push(100 - execSum);

        // Color each process (Remaining part -> gray(#D3D3D3))
        const colors = [...processes.map((p) => p.color), "#D3D3D3"]; 

        // If there is no chart
        if (!chart.current) {

            // Draw Initial Chart
            chart.current = new Chart(ctx, {

                type: "doughnut",

                data: {
                    labels: [...processes.map((p) => p.id), "Remaining"],

                    datasets: [
                        {
                            data: execPercentages,
                            backgroundColor: colors,
                        },
                    ],
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "0%",
                    animation: {
                        duration: 1000,
                        easing: "easeInOutCubic",
                    },

                    plugins: {
                        title: {
                            display: true,
                            text: "Progress (%)",
                            font: { size: 18, weight: "bold", family: "'Playfair Display', serif" },
                            padding: { top: 10, bottom: 10 },
                        },

                        legend: {
                            labels: {
                                filter: (legendItem, chartData) => {
                                    return legendItem.text !== "Remaining";
                                },
                                font: { size: 18, family: "'Playfair Display', serif" },
                            },
                        },
                    },
                },
            });
        } else {

            // Update Chart
            chart.current.data.datasets[0].data = [...execPercentages]; 
            chart.current.data.datasets[0].backgroundColor = [...colors]; 
            chart.current.update("active");
        }
    }, [processes, execProgress]);

    return <canvas ref={chartRef} style={styles.canvas}></canvas>;
};

const styles = {
    canvas: {
        width: "100%",
        height: "250px",
        display: "block",
        margin: "auto",
    },
};

export default PieChart;
