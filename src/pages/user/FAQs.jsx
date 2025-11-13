import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./FAQs.css";
import { FaChevronDown } from "react-icons/fa";

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const faqRefs = useRef([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${API_BASE}/faqs`);
        setFaqs(res.data);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
    if (activeIndex !== index) {
      setTimeout(() => {
        faqRefs.current[index]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }, 200);
    }
  };

  return (
    <div className="faqs-page">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.length > 0 ? (
          faqs.map((faq, index) => (
            <div
              key={faq.faq_id}
              className={`faq-item ${activeIndex === index ? "active highlight" : ""}`}
              ref={(el) => (faqRefs.current[index] = el)}
              onClick={() => toggleFAQ(index)}
              aria-expanded={activeIndex === index}
            >
              <div className="faq-question">
                <span>{faq.question}</span>
                <FaChevronDown
                  className={`chevron ${activeIndex === index ? "rotate bounce" : ""}`}
                  aria-hidden="true"
                />
              </div>
              {activeIndex === index && (
                <div className="faq-answer">{faq.answer}</div>
              )}
            </div>
          ))
        ) : (
          <p>No FAQs available.</p>
        )}
      </div>
    </div>
  );
};

export default FAQs;
