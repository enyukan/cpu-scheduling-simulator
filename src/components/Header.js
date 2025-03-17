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
        background: "#e1eff0", // Header background black
        color: "#507882", // Text white
        textAlign: "center",
        padding: "30px",
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1000,
        fontFamily: "'Playfair Display', serif", // Apply Playfair Display font
    },
    title: {
        margin: "10px 0",
        fontSize: "40px",
    },
};

export default Header;
