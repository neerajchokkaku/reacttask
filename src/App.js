import React, { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import "./App.css";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyDkUjU7kCTnmEt7zByWaoL9u5_h0NZndF4HWco4_nk26y0NjD9qO1fdntbm92u6s1I/exec";

function App() {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const services = [
    { name: "Bookkeeping", price: 500 },
    { name: "Branch Office Setup", price: 300 },
    { name: "VAT & Tax Number", price: 200 },
    { name: "Employer Registration", price: 150 },
    { name: "VAT & Tax Filing", price: 250 },
    { name: "Legal Documents", price: 400 },
    { name: "Government Portals Access", price: 100 },
  ];

  const handleServiceToggle = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleGetQuote = () => {
    setShowQuoteForm(true);
  };

  const calculateTotal = () => {
    const basePrice = 1495;
    const additionalServices = selectedServices.reduce(
      (sum, service) => sum + (services.find((s) => s.name === service)?.price || 0),
      0
    );
    return basePrice + additionalServices;
  };

  const renderServiceDetails = () => {
    if (selectedServices.length === 0) {
      return <p className="no-services">No additional services selected</p>;
    }

    return selectedServices.map((serviceName) => {
      const service = services.find((s) => s.name === serviceName);
      return (
        <div key={serviceName} className="selected-service-item">
          <span>{serviceName}</span>
          <span>€{service?.price || 0}</span>
        </div>
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email,
      companyName,
      selectedServices: selectedServices.join(", "),
      services: selectedServices.map((service) => ({
        name: service,
        price: services.find((s) => s.name === service)?.price || 0,
      })),
      total: calculateTotal(),
      basePrice: 1495,
      additionalServices: calculateTotal() - 1495,
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setShowQuoteForm(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setEmail("");
        setCompanyName("");
        setSelectedServices([]);
      }, 3000);
    } catch (error) {
      console.error("Error submitting to Google Sheets:", error);
      alert("There was an error submitting your quote request. Please try again.");
    }
  };

  return (
    <div className="App">
      <div className="quote-container">
        <div className="left-section">
          <h1 className="title-animation">eBranch Workspace</h1>
          <p className="subtitle fade-in">Empower your global business journey</p>

          <div className="services-package-grid">
            <div className="services-card slide-in-left">
              <h2>Additional Services</h2>
              <div className="services-list">
                {services.map((service) => (
                  <label key={service.name} className="service-item">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.name)}
                      onChange={() => handleServiceToggle(service.name)}
                    />
                    <span>
                      {service.name} <small>(+€{service.price})</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="package-card slide-in-right">
              <h3>Package Summary</h3>
              <div className="price-info">
                <p className="base-price">Base: €1,495/year</p>
                {selectedServices.length > 0 && (
                  <div className="selected-services">
                    <h4>Additional Services:</h4>
                    {renderServiceDetails()}
                  </div>
                )}
                <p className="additional-total">Additional: €{calculateTotal() - 1495}</p>
                <p className="total-price">Total: €{calculateTotal()}/year</p>
              </div>
              <button onClick={handleGetQuote} className="quote-button">
                Get Quote <ArrowRight className="button-icon" size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="benefits-section">
            <h3 className="benefits-title">Why Choose eBranch Workspace?</h3>
            <div className="benefits-grid">
              {[
                "Manage everything in one intuitive platform",
                "AI-powered assistance for smarter operations",
                "Seamless global business expansion",
                "Ensure compliance across multiple jurisdictions",
                "Significant savings on traditional accounting and legal fees",
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="benefit-card"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    transform: `translateY(${index * 20}px)`,
                  }}
                >
                  <div className="benefit-icon">
                    <Check size={20} className="check-icon" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showQuoteForm && (
          <div className="quote-form-overlay">
            <div className="quote-form-modal">
              <button className="close-modal" onClick={() => setShowQuoteForm(false)}>
                ×
              </button>
              <h3 className="form-title">Get Your Personalized Quote</h3>
              <form onSubmit={handleSubmit} className="quote-form">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="submit-button">
                  Send Quote Request <ArrowRight className="button-icon" size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="success-popup">
            <h3>Thank you!</h3>
            <p>We'll be in touch soon with your personalized quote.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
