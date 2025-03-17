import React, { useEffect, useState, useRef } from "react";
import ChartContainer from "./ChartContainer";
import Timer from "./Timer";
import jsPDF from "jspdf";


//Define Functional Component
const FIFOSimulator = () => {

    //Check if the simulation is running or not
    const [isRunning, setIsRunning] = useState(false);

    //Current Time
    const [currentTime, setCurrentTime] = useState(0);

    //Overall Run Progress
    const [executionProgress, setExecutionProgress] = useState(0);

    //Number of processes to create (at least 3 processes)
    const [numProcesses, setNumProcesses] = useState(3);

    //Array that store a list of processes to run
    const [processes, setProcesses] = useState([]);

    //Execution logs for PDF saving
    const [executionLogs, setExecutionLogs] = useState([]);


    // Mapping process-specific colors
    const colorMap = useRef({});
    const availableColors = ["#F4D1D6", "#D8A8C3", "#E4B9D9", "#A0B8B1", "#E1C7B0", "#D4D7E1", "#F1E1A6", "#F2C9A1", "#D4A79E", "#A3C9B2"];



    //A function that specifies a color according to the process ID
    const getColorForProcess = (id) => {
        if (!colorMap.current[id]) {
            colorMap.current[id] = availableColors[Object.keys(colorMap.current).length % availableColors.length];
        }
        return colorMap.current[id];
    };


    // Generate random process
    const generateRandomProcesses = (count) => {

        let newProcesses = Array.from({ length: count }, (_, i) => {
            const processId = `P${i + 1}`;

            //Set arrival, burstTime randomly
            return {
                id: processId,
                arrival: Math.floor(Math.random() * 6),
                burstTime: Math.floor(Math.random() * 6) + 2,
                initialBurst: 0,
                color: getColorForProcess(processId),
            };
        });

        //Sort in ascending order based on arrival time
        newProcesses = newProcesses.sort((a, b) => a.arrival - b.arrival);

        //Save the initial burstTime separately to remember the initial execution order even during execution
        newProcesses = newProcesses.map((p) => ({ ...p, initialBurst: p.burstTime }));

        setProcesses(newProcesses);
        setExecutionLogs([]); 
    };


    //Start FIFO simulation
    const startSimulation = () => {
        if (isRunning) return;
        setIsRunning(true);
        setCurrentTime(0);
        setExecutionProgress(0);
        setExecutionLogs([]);
        runFIFO();
    };


    const runFIFO = () => {
        let totalBurst = processes.reduce((acc, p) => acc + p.burstTime, 0);
        let executedTime = 0;

        const executeProcess = (index) => {
            if (index >= processes.length) {
                setIsRunning(false);
                setTimeout(() => {
                    setCurrentTime(0);
                    setExecutionProgress(0);
                }, 500);
                return;
            }

            const process = processes[index];
            let burstLeft = process.burstTime;

            const interval = setInterval(() => {
                if (burstLeft > 0) {
                    setCurrentTime((prev) => prev + 1);
                    burstLeft--;
                    executedTime++;

                    setExecutionProgress((executedTime / totalBurst) * 100);

                    setProcesses((prevProcesses) =>
                        prevProcesses.map((p) =>
                            p.id === process.id ? { ...p, burstTime: burstLeft, color: p.color } : p
                        )
                    );

                    // Record log for execution progress
                    setExecutionLogs((prevLogs) => [
                        ...prevLogs,
                        `Time ${currentTime + 1}: Process ${process.id} executed (Remaining time: ${burstLeft})`,
                    ]);

                } else {
                    clearInterval(interval);
                    executeProcess(index + 1);
                }
            }, 500);
        };

        executeProcess(0);
    };


    // Save execution log as pdf
    const saveLogsAsPDF = () => {
        const pdf = new jsPDF();
        pdf.text("FIFO Scheduling Execution Logs", 10, 10);
        
        executionLogs.forEach((log, index) => {
            pdf.text(log, 10, 20 + index * 5);
        });

        pdf.save("FIFO_Logs.pdf");
    };

    
    return (
        <div style={styles.container}>
            <div>
                <label style={styles.label}>Number of Processes: </label>
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={numProcesses}
                    onChange={(e) => setNumProcesses(Number(e.target.value))}
                    style={styles.input}
                />
                <button onClick={() => generateRandomProcesses(numProcesses)} style={styles.generateButton}>
                    Generate Processes
                </button>
            </div>

            <Timer currentTime={currentTime} />

            <ChartContainer processes={processes} executionProgress={executionProgress} />

        
            <button onClick={saveLogsAsPDF} style={styles.button}>
                Download
            </button>

            <button onClick={startSimulation} disabled={isRunning} style={styles.button}>
                Start
            </button>
        </div>
    );
};

const styles = {
    container: {
        textAlign: "center",
        marginTop: "10px",
        marginBottom: "10px",
    },
    label: {
        fontSize: "16px",
        fontWeight: "bold",
        marginBottom: "30px",
    },
    input: {
        width: "60px",
        fontSize: "16px",
        padding: "5px",
        margin: "10px",
        marginBottom: "30px",
    },
    generateButton: {
        background: "linear-gradient(135deg,#e1eff0, #e1eff0)",
        color: "#507882",
        fontSize: "18px",
        padding: "12px 24px",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        marginTop: "15px",
        marginRight: "10px",
        marginLeft: "10px",
    },
    button: {
        background: "linear-gradient(135deg,#e1eff0, #e1eff0)",
        color: "#507882",
        fontSize: "18px",
        padding: "12px 24px",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        marginTop: "15px",
        marginRight: "10px",
        marginLeft: "10px",
    },
};

export default FIFOSimulator;