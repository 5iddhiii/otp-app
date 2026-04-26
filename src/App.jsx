import { useState } from "react";
import { auth } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import "./App.css";

function App() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmObj, setConfirmObj] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const initRecaptcha = async () => {
    try {
      // Clear any existing verifier to avoid conflicts
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // Wait a moment for the script to be available
      await new Promise((resolve) => setTimeout(resolve, 100));

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );

      console.log("reCAPTCHA initialized successfully");
      return true;
    } catch (error) {
      console.error("reCAPTCHA initialization error:", error);
      window.recaptchaVerifier = null;
      return false;
    }
  };

  const sendOtp = async () => {
    const phoneNum = phone.trim();
    
    if (phoneNum.length !== 10) {
      return alert("Enter valid 10-digit phone number");
    }

    try {
      setLoading(true);

      // Initialize recaptcha before sending OTP
      const recaptchaReady = await initRecaptcha();
      if (!recaptchaReady) {
        throw new Error("reCAPTCHA initialization failed");
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+91" + phoneNum,
        window.recaptchaVerifier
      );

      setConfirmObj(confirmation);
      alert("OTP Sent Successfully! otp is -123456 for testing");
    } catch (error) {
      console.error("Send OTP Error:", error);
      alert("Error: " + (error.message || "Failed to send OTP"));
      
      // Clear verifier on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmObj) {
      return alert("Please send OTP first");
    }

    const otpCode = otp.trim();
    if (otpCode.length !== 6) {
      return alert("OTP must be 6 digits");
    }

    try {
      setLoading(true);
      const result = await confirmObj.confirm(otpCode);
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));
      alert("Login successful!");
    } catch (error) {
      console.error("Verify OTP Error:", error);
      alert("Invalid OTP. Please try again.");
      // Reset for retry
      setConfirmObj(null);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>OTP Verification</h2>
        <p className="subtitle">Verify your phone number</p>

        {!user ? (
          <>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button onClick={sendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="hint">
              Test: 9999999999 | OTP: 123456
            </p>
          </>
        ) : (
          <div className="success">
            <h3>Successfully Logged In</h3>
            <p>User ID:</p>
            <small>{user.uid}</small>
          </div>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}

export default App;