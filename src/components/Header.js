import React from "react";

function Header({ scrollToSection }) {
    const buttons = ["FIFO", "SJF", "STCF", "RR", "MLFQ"]; 

    return (
        <header style={styles.header}>
            <div style={styles.authorInfo}>
                <p>Sejun Moon (A279G723)</p>
            </div>

            <h1 style={styles.title}>CPU Scheduler</h1>

            <nav style={styles.nav}>
                {buttons.map((button) => (
                    <button
                        key={button}
                        style={styles.button}
                        onClick={() => scrollToSection(button)}
                    >
                        {button}
                    </button>
                ))}
            </nav>
        </header>
    );
}

const styles = {
    header: {
        background: "#333",
        color: "#fff",
        textAlign: "center",
        padding: "15px",
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1000,
    },

    title: {
        margin: "10px 0 5px 0",
        fontSize: "24px",
    },

    authorInfo: {
        fontSize: "12px",
        position: "absolute",
        right: "40px",
        top: "10px",
        color: "#ccc",
        maxWidth: "150px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
    },

    nav: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginTop: "10px",
    },

    button: {
        background: "#778899",
        color: "#fff",
        border: "none",
        padding: "10px 20px",
        borderRadius: "25px",
        fontSize: "16px",
        cursor: "pointer",
        transition: "background 0.3s ease",
        minWidth: "100px",
    },
};

export default Header;


