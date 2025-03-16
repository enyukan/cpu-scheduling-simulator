import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";


//Register to use modules in charts
Chart.register(...registerables);

//Bar Chart Component (We need processes info)
const BarChart = ({ processes = [] }) => {

    // Space for drawing chart
    const chartRef = useRef(null);

    //Chart object
    const chartInstance = useRef(null);


    //Execute the following code every time 'processes' changes
    useEffect(() => {

        if (!chartRef.current) return;

        //drawing tool
        const ctx = chartRef.current.getContext("2d");

        if (!chartInstance.current) {

            //Draw initial chart
            chartInstance.current = new Chart(ctx, {

                type: "bar",

                data: {
                    labels: processes.map((p) => p.id),


                    datasets: [
                        {
                            label: "Burst Time",
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
                            title: { display: true, text: "Arrival" },
                        },
                        y: {
                            beginAtZero: true,
                            max: Math.max(...processes.map((p) => p.initialBurst), 10),
                            title: { display: true, text: "Burst Time" },
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
                                        ctx.fillStyle = "#000";
                                        ctx.font = "bold 14px Arial";
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