"use client";

import React, { useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "./ContactFormModal.module.css";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactFormModal({ isOpen, onClose }: Props) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState<string | undefined>();
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        setLoading(true);

        const res = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                phone,
                message
            })
        });

        setLoading(false);

        if (res.ok) {

            setSuccess(true);

            setFirstName("");
            setLastName("");
            setEmail("");
            setPhone(undefined);
            setMessage("");

            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2500);

        } else {

            alert("Something went wrong. Please try again.");

        }

    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <button
                    className={styles.close}
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2>Get in Touch</h2>

                {success && (
                    <div className={styles.success}>
                        <div className={styles.checkmark}>✓</div>
                        <p>Message sent successfully. Our team will contact you soon.</p>
                    </div>
                )}

                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                >

                    <div className={styles.row}>

                        <input
                            type="text"
                            placeholder="First Name"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />

                    </div>

                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className={styles.phoneWrapper}>
                        <PhoneInput
                            international
                            defaultCountry="IN"
                            placeholder="Enter phone number"
                            value={phone}
                            onChange={setPhone}
                        />
                    </div>

                    <textarea
                        placeholder="Your Message"
                        rows={4}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <button
                        type="submit"
                        className={styles.submit}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>

                </form>

            </div>
        </div>
    );
}