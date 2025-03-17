import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Register to use modules in charts
Chart.register(...registerables);

// Bar Chart Component (We need processes info)
const BarChart = ({ processes = [] }) => {

    // Space for drawing chart
    const chartRef = useRef(null);

    // Chart object
    const chartInstance = useRef(null);

    // Execute the following code every time 'processes' changes
    useEffect(() => {

        if (!chartRef.current) return;

        // Drawing tool
        const ctx = chartRef.current.getContext("2d");

        if (!chartInstance.current) {

            // Draw initial chart
            chartInstance.current = new Chart(ctx, {

                type: "bar",

                data: {
                    labels: processes.map((p) => p.id),

                    datasets: [
                        {
                            label: "CPU Burst Time (s)",
                            data: processes.map((p) => p.burstTime),
                            backgroundColor: processes.map((p) => p.color),
                            borderWidth: 1,
                        },
                    ],
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    animation: {
                        duration: 800,
                        easing: "easeInOutCubic",
                    },

                    scales: {
                        x: {
                            title: { 
                                display: true, 
                                // we are assuming each process comes in 1 second later than the one next to it
                                text: "Processes", 
                                font: {
                                    size: 14,
                                    family: "'Playfair Display', serif"
                                },
                            },
                            ticks: {
                                font: {
                                    size: 14,
                                    family: "'Playfair Display', serif"
                                },
                            },
                        },
                        y: {
                            beginAtZero: true,
                            max: Math.max(...processes.map((p) => p.initialBurst), 10),
                            title: { 
                                display: true, 
                                text: "CPU Burst Time (s)", 
                                font: {
                                    size: 14,
                                    family: "'Playfair Display', serif"
                                },
                            },
                            ticks: {
                                font: {
                                    size: 14,
                                    family: "'Playfair Display', serif"
                                },
                            },
                        },
                    },

                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                    },

                },

                plugins: [
                    {
                        id: "burstTimeLabels",

                        afterDatasetsDraw(chart) {
                            const ctx = chart.ctx;
                            ctx.save();
                            chart.data.datasets.forEach((dataset, i) => {
                                const meta = chart.getDatasetMeta(i);
                                meta.data.forEach((bar, index) => {
                                    const value = dataset.data[index];

                                    if (value > 0) {
                                        ctx.fillStyle = "#507882";
                                        ctx.font = "14px 'Playfair Display', serif";
                                        ctx.textAlign = "center";
                                        ctx.fillText(value, bar.x, bar.y - 10);
                                    }
                                });
                            });
                            ctx.restore();
                        },
                    },
                ],
            });
        } else {
            // Update chart
            chartInstance.current.data.labels = processes.map((p) => p.id);
            chartInstance.current.data.datasets[0].data = processes.map((p) => p.burstTime);
            chartInstance.current.data.datasets[0].backgroundColor = processes.map((p) => p.color);
            chartInstance.current.update("active");
        }
    }, [processes]);

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

export default BarChart;
