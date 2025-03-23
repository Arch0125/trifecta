"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { ethers } from "ethers";

export default function Home() {
  const [receiverName, setReceiverName] = useState("");
  const [receiverMail, setReceiverMail] = useState("");
  const [items, setItems] = useState([{ name: "", amount: "" }]);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // New states for account info
  const [showBalance, setShowBalance] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleAddItem = () =>
    setItems((prev) => [...prev, { name: "", amount: "" }]);

  const handleRemoveItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleItemChange = (
    index: number,
    field: "name" | "amount",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const handleSendInvoice = async () => {
    try {
      if (!invoiceRef.current) return;
      const canvas = await html2canvas(invoiceRef.current);
      const dataUrl = canvas.toDataURL("image/png");
      const total = getTotalAmount();

      const response = await fetch("/api/sendInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: receiverMail,
          subject: `Send ${total} TEST to relayer@emailwallet.org`,
          image: dataUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to send invoice");
      alert("Invoice sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Error sending invoice");
    }
  };

  const handleDecrypt = async () => {
    await fetch("http://127.0.0.1:8080/decrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: "trifecta22937@gmail.com",
        amount: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Decrypted balance:", data);
        setBalance(data);
      })
      .catch((error) => console.error("Decryption error:", error));

      setShowBalance((prev) => !prev);
  };

  const handleWithdraw = async() => {
    alert(`Attempting to withdraw $${withdrawAmount}`);
    await fetch("http://127.0.0.1:8080/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: "trifecta22937@gmail.com",
        amount: 1,
      }),
    })
      .then((response) => response.text())
      .then(async (data:string) => {
        if(data.includes("true")){
          const provider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/0fxbpb4OCXkkyHhFNPBRelJsFg7XdhML");
    console.log(process.env.NEXT_PUBLIC_PVT_KEY)
          const signer = new ethers.Wallet(process.env.NEXT_PUBLIC_PVT_KEY as string, provider);
          const usdcContract = new ethers.Contract("0x036CbD53842c5426634e7929541eC2318f3dCF7e", [
            {
              constant: false,
              inputs: [
                { name: '_to', type: 'address' },
                { name: '_value', type: 'uint256' },
              ],
              name: 'transfer',
              outputs: [{ name: '', type: 'bool' }],
              type: 'function',
            },
          ], signer);

          const tx = await usdcContract.transfer("0x187E7D2256c55b68F97C5E35b6A9aC6e0F8Bc669", ethers.parseUnits(withdrawAmount, 6));
          console.log("Transaction hash:", tx.hash);
          alert(`Withdrawal of $${withdrawAmount} successful!`);
        }
      })
      .catch((error) => console.error("Decryption error:", error));


    
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#ffffff",
        color: "#4B5563",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Left: Placeholder PayPal Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "#2563EB" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" />
          </svg>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "1.25rem",
              color: "#374151",
            }}
          >
            zkPay
          </span>
        </div>
        {/* Right: Gear Icon */}
        <button
          style={{
            color: "#6B7280",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: "1.5rem", width: "1.5rem" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.947 1.603-.947 1.902 0l.764 2.415a1 1 0 00.95.69h2.54c.969 0 1.371 1.24.588 1.81l-2.054 1.49a1 1 0 00-.364 1.118l.764 2.415c.3.947-.755 1.736-1.54 1.18l-2.054-1.49a1 1 0 00-1.176 0l-2.054 1.49c-.784.556-1.838-.233-1.539-1.18l.764-2.415a1 1 0 00-.364-1.118l-2.054-1.49c-.783-.57-.38-1.81.588-1.81h2.54a1 1 0 00.95-.69l.764-2.415z"
            />
          </svg>
        </button>
      </header>

      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "0.5rem",
          }}
        >
          Account Info
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#6B7280", margin: 0, marginBottom: "1rem" }}>
          trifecta22937@gmail.com
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1rem", color: "#374151" }}>
            Balance: {showBalance ? `$${balance.toFixed(2)}` : "******"}
          </span>
          <button
            onClick={handleDecrypt}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              border: "1px solid #D1D5DB",
              borderRadius: "0.375rem",
              backgroundColor: "#fff",
              cursor: "pointer",
              color: "#374151",
            }}
          >
            {showBalance ? "Hide" : "Decrypt"}
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount to withdraw"
            style={{
              width: "10rem",
              padding: "0.5rem 0.75rem",
              border: "1px solid #D1D5DB",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
          />
          <button
            onClick={handleWithdraw}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              border: "none",
              borderRadius: "0.375rem",
              backgroundColor: "#2563EB",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Invoice Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1
            style={{
              fontSize: "1rem",
              fontWeight: 500,
              color: "#1F2937",
              margin: 0,
            }}
          >
            New invoice No: <span style={{ fontWeight: 600 }}>325</span>
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#6B7280", margin: 0 }}>
            Date: 03/29/2024 &middot; Due: On receipt
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              border: "1px solid #D1D5DB",
              borderRadius: "0.375rem",
              backgroundColor: "#fff",
              cursor: "pointer",
              color: "#374151",
            }}
          >
            More actions
          </button>
          <button
            onClick={handleSendInvoice}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              border: "none",
              borderRadius: "0.375rem",
              backgroundColor: "#2563EB",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: "1.5rem",
          padding: "1.5rem",
          flex: "1",
        }}
      >
        {/* Left Column */}
        <div
          style={{
            gridColumn: "span 12",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "0.375rem",
              padding: "1rem",
            }}
          >
            <h2
              style={{
                fontWeight: 500,
                color: "#1F2937",
                marginBottom: "0.5rem",
              }}
            >
              Who are you billing?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="John Joshua"
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #D1D5DB",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={receiverMail}
                  onChange={(e) => setReceiverMail(e.target.value)}
                  placeholder="john@mail.com"
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #D1D5DB",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "0.375rem",
              padding: "1rem",
            }}
          >
            <h2
              style={{
                fontWeight: 500,
                color: "#1F2937",
                marginBottom: "0.5rem",
              }}
            >
              What are they paying for?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.75rem",
                      border: "1px solid #D1D5DB",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) =>
                      handleItemChange(index, "amount", e.target.value)
                    }
                    style={{
                      width: "5.5rem",
                      padding: "0.5rem 0.75rem",
                      border: "1px solid #D1D5DB",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6B7280",
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ height: "1.25rem", width: "1.25rem" }}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 7a1 1 0 00-.993.883L8 8v5a1 1 0 001.993.117L10 13V8a1 1 0 00-1-1zM5 8a1 1 0 011-1h8a1 1 0 011 1v5a3 3 0 01-3 3H8a3 3 0 01-3-3V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddItem}
                style={{
                  marginTop: "0.25rem",
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px dashed #2563EB",
                  borderRadius: "0.375rem",
                  backgroundColor: "transparent",
                  color: "#2563EB",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                + Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div
          style={{
            gridColumn: "span 12",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Tab Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <button
              style={{
                padding: "0.5rem 1rem",
                borderBottom: "2px solid #2563EB",
                color: "#2563EB",
                fontWeight: 500,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Invoice Preview PDF
            </button>
            <button
              style={{
                padding: "0.5rem 1rem",
                color: "#6B7280",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Mobile preview
            </button>
          </div>
          {/* Preview Card */}
          <div
            ref={invoiceRef}
            style={{
              backgroundColor: "#F9FAFB",
              border: "1px solid #e5e7eb",
              borderRadius: "0.375rem",
              padding: "1.5rem",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#374151",
                  margin: 0,
                }}
              >
                Flora Landscaping
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  margin: 0,
                }}
              >
                1001 Roads St, San Jose, CA
              </p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <p
                style={{
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: "#374151",
                  margin: 0,
                }}
              >
                {receiverName || "John Joshua"}
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  margin: 0,
                }}
              >
                {receiverMail || "john@mail.com"}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e5e7eb",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <span style={{ color: "#374151" }}>
                    {item.name || "Item"}
                  </span>
                  <span style={{ color: "#374151" }}>
                    ${parseFloat(item.amount || "0").toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #D1D5DB",
              }}
            >
              <span style={{ fontWeight: 600, color: "#374151" }}>Total</span>
              <span style={{ fontWeight: 600, color: "#374151" }}>
                ${getTotalAmount().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Section */}
      
    </div>
  );
}
