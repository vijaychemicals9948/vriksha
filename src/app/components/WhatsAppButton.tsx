"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
    const phone = "919940419286";
    const message = "Hi, I am interested in your products.";

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
            aria-label="Chat on WhatsApp"
        >
            <FaWhatsapp size={28} color="white" />
        </a>
    );
}