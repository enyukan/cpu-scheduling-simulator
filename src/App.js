import React, { useRef } from "react";
import Header from "./components/Header";
import AlgorithmSection from "./components/AlgorithmSection";
import FIFOSimulator from "./components/FIFOSimulator";
import SJFSimulator from "./components/SJFSimulator";
import RRSimulator from "./components/RRSimulator";
import STCFSimulator from "./components/STCFSimulator";
import MLFQSimulator from "./components/MLFQSimulator";


//Define App Components (Manage all UI in this file)
function App() {

    const sectionRef = {
        //Refer to each Algorithm Section location
        FIFO: useRef(null),
        SJF: useRef(null),
        STCF: useRef(null),
        RR: useRef(null),
        MLFQ: useRef(null),
    };

    // Description
    const descriptions = {
        FIFO: "Processes are executed in the order they arrive. (First In, First Out)",
        SJF: "Executes the process with the shortest burst time first. (Shortest Job First)",
        STCF: "Preemptive SJF: The process with the least remaining time executes next.",
        RR: "Each process gets a fixed time slot before moving to the next. (Round Robin)",
        MLFQ: "Multiple priority queues adjust based on CPU burst time. (Multi-Level Feedback Queue)"
    };




    // Mapping Simulators to each algorithm
    const simulators = {
        FIFO: FIFOSimulator,
        SJF: SJFSimulator,
        STCF: STCFSimulator, 
        RR: RRSimulator,   
        MLFQ: MLFQSimulator, 
    };




    // Move to the corresponding section when a particular algorithm is selected in the header
    const scrollToSection = (id) => {

        //Bring header's height
        const headerHeight = document.querySelector("header").offsetHeight;

        //Gets the DOM of the corresponding algorithm section
        if (sectionRef[id]?.current) {

            //Calculate the screen position of the section and put the value into the variable 'elementPosition'
            const elementPosition = sectionRef[id].current.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({

                //Adjustment of position
                top: elementPosition - headerHeight + 85,
                behavior: "smooth",
            });
        }
    };



    //UI for Header and all of algorithm section buttons
    return (
        <div>
            <Header scrollToSection={scrollToSection} />

            <div style={{ marginTop: "80px" }}>


                {/* Bring the keys (FIFO, SJF, RR, ..) in sectionRef into the array and execute them one by one
                Use map() to perform individual action for each element */}


                {Object.keys(sectionRef).map((key) => {

                    // The simulator corresponding to the key is retrieved from the 'simulator' and stored in 'SimulatorComponent' 
                    const SimulatorComponent = simulators[key];


                    return (
                        <div key={key} ref={sectionRef[key]}>


                            {/* Pass id, title, description, simulatorComponent for each key (FIFO, SJF, STCF ...) */}
                            <AlgorithmSection 
                                id={key} 
                                title={`${key} Scheduling`} 
                                description={descriptions[key]} 
                                SimulatorComponent={SimulatorComponent}
                            />

                        </div>
                    );

                })}

            </div>

        </div>
    );
}

export default App;