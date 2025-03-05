import React, { useState } from "react";

const App = () => {
  const [numProcesses, setNumProcesses] = useState(5);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [processes, setProcesses] = useState([]);

  // Function to generate random processes
  const generateProcesses = () => {
    const newProcesses = Array.from({ length: numProcesses }, (_, i) => ({
      id: i + 1,
      arrivalTime: Math.floor(Math.random() * 10), // Random arrival time between 0-9
      burstTime: Math.floor(Math.random() * 10) + 1, // Random burst time between 1-10
    }));
    setProcesses(newProcesses);
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
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Generate Processes
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
    </div>
  );
};

export default App;
