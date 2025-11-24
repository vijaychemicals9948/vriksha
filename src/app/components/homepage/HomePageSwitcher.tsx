"use client";
import { useState } from "react";
import NavbarV1 from "../navbar/NavbarV1";
import NavbarV2 from "../navbar/Navbar";
import HeroV1 from "./HeroV1";
import HeroV2 from "./Hero";
import HeroV3 from "./HeroV2";

export default function HomePageSwitcher() {
    const [version, setVersion] = useState<1 | 2 | 3>(1);

    const handleSwitch = () => {
        setVersion(v => (v === 3 ? 1 : (v + 1) as 1 | 2 | 3)); // 1 → 2 → 3 → 1
    };

    return (
        <>
            <button
                onClick={handleSwitch}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    padding: "10px 15px",
                    background: "#000",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: "8px",
                    zIndex: 9999,
                    cursor: "pointer",
                }}
            >
                Switch to Design {version === 1 ? "2" : version === 2 ? "3" : "1"}
            </button>

            {/* Navbar */}
            {version === 1 && <NavbarV1 key="nav1" />}
            {version === 2 && <NavbarV2 key="nav2" />}
            {version === 3 && <NavbarV2 key="nav3" />} {/* If 3rd version navbar same or new */}

            {/* Hero Section */}
            {version === 1 && <HeroV1 key="hero1" />}
            {version === 2 && <HeroV2 key="hero2" />}
            {version === 3 && <HeroV3 key="hero3" />}
        </>
    );
}
