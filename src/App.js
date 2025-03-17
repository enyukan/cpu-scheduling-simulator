import React, { useRef } from "react";
import Header from "./components/Header";
import Section from "./components/Section";
import FIFO from "./components/FIFO";
import SJF from "./components/SJF";
import STCF from "./components/STCF";
import RR from "./components/RR";
import MLFQ from "./components/MLFQ";

function App() {
    const sectionRefs = {
        FIFO: useRef(null),
        SJF: useRef(null),
        STCF: useRef(null),
        RR: useRef(null),
        MLFQ: useRef(null),
    };

    const simulators = {
        FIFO: FIFO,
        SJF: SJF,
        STCF: STCF, 
        RR: RR,   
        MLFQ: MLFQ, 
    };

    const scrollToSection = (id) => {
        const headerHeight = document.querySelector("header").offsetHeight;

        if (sectionRefs[id]?.current) {
            const elementPosition = sectionRefs[id].current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - headerHeight + 85,
                behavior: "smooth",
            });
        }
    };

    return (
        <div style={styles.container}>
            <Header scrollToSection={scrollToSection} />
            <div style={styles.content}>
                {Object.keys(sectionRefs).map((key) => {
                    const Simulator = simulators[key];
                    return (
                        <div key={key} ref={sectionRefs[key]}>
                            <Section id={key} title={`${key} Scheduling`} Simulator={Simulator} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: "#efece6",
        color: "#507882",
        fontFamily: "'Playfair Display', serif",
        minHeight: "100vh",
    },
    content: {
        marginTop: "80px",
    },
};

export default App;
