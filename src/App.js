import React, { useState } from "react";

const App = () => {
  const [numProcesses, setNumProcesses] = useState(5);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [processes, setProcesses] = useState([]);
  const [fifoResults, setFifoResults] = useState([]);

  // Function to generate random processes
  const generateProcesses = () => {
    const newProcesses = Array.from({ length: numProcesses }, (_, i) => ({
      id: i + 1,
      arrivalTime: Math.floor(Math.random() * 10), // Random arrival time between 0-9
      burstTime: Math.floor(Math.random() * 10) + 1, // Random burst time between 1-10
    }));
    setProcesses(newProcesses);
    setFifoResults([]); // Reset FIFO results when new processes are generated
  };

  // FIFO Scheduling Algorithm
  const runFIFO = () => {
    if (processes.length === 0) return;

    // Sort processes by arrival time (FIFO order)
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

    let currentTime = 0;
    let results = sortedProcesses.map((process) => {
      const startTime = Math.max(currentTime, process.arrivalTime);
      const finishTime = startTime + process.burstTime;
      currentTime = finishTime;

      return {
        ...process,
        startTime,
        finishTime,
        turnaroundTime: finishTime - process.arrivalTime,
        waitingTime: startTime - process.arrivalTime,
      };
    });

    setFifoResults(results);
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <h1>CPU Scheduling Simulator</h1>

      <div style={{ margin: "20px" }}>
        <label style={{ display: "block", margin: "10px" }}>
          Number of Processes:
          <input
            type="number"
            value={numProcesses}
            onChange={(e) => setNumProcesses(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>

        <label style={{ display: "block", margin: "10px" }}>
          Time Quantum (for RR):
          <input
            type="number"
            value={timeQuantum}
            onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
      </div>

      <button 
        onClick={generateProcesses}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", marginRight: "10px" }}
      >
        Generate Processes
      </button>

      <button 
        onClick={runFIFO}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        disabled={processes.length === 0}
      >
        Run FIFO
      </button>

      {processes.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Processes</h2>
          <table border="1" style={{ margin: "auto", borderCollapse: "collapse", width: "50%" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px" }}>Process ID</th>
                <th style={{ padding: "8px" }}>Arrival Time</th>
                <th style={{ padding: "8px" }}>Burst Time</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.id}>
                  <td style={{ padding: "8px" }}>{process.id}</td>
                  <td style={{ padding: "8px" }}>{process.arrivalTime}</td>
                  <td style={{ padding: "8px" }}>{process.burstTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fifoResults.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>FIFO Scheduling Results</h2>
          <table border="1" style={{ margin: "auto", borderCollapse: "collapse", width: "60%" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px" }}>Process ID</th>
                <th style={{ padding: "8px" }}>Start Time</th>
                <th style={{ padding: "8px" }}>Finish Time</th>
                <th style={{ padding: "8px" }}>Turnaround Time</th>
                <th style={{ padding: "8px" }}>Waiting Time</th>
              </tr>
            </thead>
            <tbody>
              {fifoResults.map((result) => (
                <tr key={result.id}>
                  <td style={{ padding: "8px" }}>{result.id}</td>
                  <td style={{ padding: "8px" }}>{result.startTime}</td>
                  <td style={{ padding: "8px" }}>{result.finishTime}</td>
                  <td style={{ padding: "8px" }}>{result.turnaroundTime}</td>
                  <td style={{ padding: "8px" }}>{result.waitingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;
