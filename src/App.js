import React, { useState } from "react";

const App = () => {
  const [numProcesses, setNumProcesses] = useState(5);
  const [timeQuantum, setTimeQuantum] = useState(2);

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
        onClick={() => console.log("Generate Processes")}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Generate Processes
      </button>
    </div>
  );
};

export default App;
