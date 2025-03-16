import React from "react";

function Header() {
    return (
        <header style={styles.header}>
            <h1 style={styles.title}>CPU Scheduling Simulator</h1>
        </header>
    );
}

const styles = {
    header: {
        background: "#FBA0E3",
        color: "#000000",
        textAlign: "center",
        padding: "15px",
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1000,
    },

    title: {
        margin: "10px 0",
        fontSize: "24px",
    },
};

export default Header;
