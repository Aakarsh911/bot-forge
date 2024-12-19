import * as React from 'react';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/main.css';
import { useSession } from 'next-auth/react';

export default function PricingCards() {
  const router = useRouter();

  const [customCreditAmount, setCustomCreditAmount] = useState(0);
  const [userCredits, setUserCredits] = useState(0);
  const [customCreditPlan, setCustomCreditPlan] = useState(0);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUserCredits(data.credits);
      } catch (error) {
        console.error('Error fetching user credits:', error);
      }
    };

    if (userId) {
      fetchCredits();
    }
  }, [userId]);


  function handleCreditInputChange(e) {
    const inputValue = e.target.value;
    if (e.target.value === '') {
        setCustomCreditAmount(0);
        return;
    }
    if (validatePositiveInteger(inputValue)) {
      // Calculate and round to 2 decimal places
      const roundedValue = (inputValue * 0.03).toFixed(2);
      setCustomCreditAmount(Number(roundedValue)); // Ensure it's stored as a number
    } else {
      e.target.value = ''; // Clear input or handle invalid input
    }
  }

  // handle custom credit plan
  function handleCustomCreditPlan(e) {
    const inputValue = e.target.value;
    if (e.target.value === '') {
        setCustomCreditPlan(0);
        return;
    }
    if (validatePositiveInteger(inputValue)) {
      // Calculate and round to 2 decimal places
      const roundedValue = (inputValue * 0.03).toFixed(2);
      setCustomCreditPlan(Number(roundedValue)); // Ensure it's stored as a number
    }
  }



  function validatePositiveInteger(value) {
    // Regular expression to check if the value is a positive integer and disallow 'e'
    return /^[0-9]+$/.test(value);
  }


  return (
      <div className="pricing-section2">
        <h1 className="credits">Credits: {userCredits}</h1>
        <div className="pricing-cards2">
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h2 className="plan-title">Starter Plan</h2>
              <p className='plan-tagline'>Ideal for individuals, small-scale use and testing.</p>
            </div>
            <div className="plan-price">
              <p>$3</p>
            </div>
            <button className="select-plan"  onClick={() => {
              router.push('stripe/3');
            }}>Buy Now</button>
            <div className="plan-details">
              <p>
                <span className="tick-icon">✔</span> 100 credits included ($0.03 per credit).
              </p>
              <p>
                <span className="tick-icon">✔</span> Ideal for small projects or testing.
              </p>
              <p>
                <span className="tick-icon">✔</span> Simple one-time payment.
              </p>
            </div>
          </div>
          <div className="pricing-card best-seller-plan">
            <div className="pricing-card-header">
              <div className="plan-title-container">
                <h2 className="plan-title">Smart Plan</h2>

              </div>
              <p className='plan-tagline'>Recharge automatically whenever credits run out.</p>
            </div>
            <div className="plan-price input-flex">
              <h3 className="custom-input">${customCreditAmount}</h3>
              <input className="pricing-input" onChange={handleCreditInputChange} type="text" placeholder="Enter credits" />
            </div>
            <button className="select-plan flexible-button" onClick={() => {
              if (customCreditAmount > 3) {
                router.push('save-payment-method?price=' + customCreditAmount*100);
              } else if (customCreditAmount<3){
                toast.error('Minimum purchasing price is $3.');

              }
            }}
            >Get Started</button>
            <div className="plan-details">
              <p>
                <span className="tick-icon">✔</span> Choose the amount to recharge with.
              </p>
              <p>
                <span className="tick-icon">✔</span> Automatically billed when credits expire.
              </p>
              <p>
                <span className="tick-icon">✔</span> Complete control over your spending.
              </p>
              <p>
                <span className="tick-icon">✔</span> Seamless credit renewal to avoid interruptions.
              </p>
              <p>
                <span className="tick-icon">✔</span> Cancel Anytime.
              </p>
            </div>
          </div>
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h2 className="plan-title">Custom Payment</h2>
              <p className='plan-tagline'>Full flexibility with a one-time payment option.</p>
            </div>
            <div className="plan-price input-flex">
              <h3 className="custom-input">${customCreditPlan}</h3>
              <input className="pricing-input" onChange={handleCustomCreditPlan} type="text" placeholder="Enter credits" />
            </div>
            <button className="select-plan flexible-button" onClick={() => {
              router.push('stripe/' + customCreditPlan);
            }}>Get Started</button>
            <div className="plan-details">
              <p>
                <span className="tick-icon">✔</span> Pay only for what you need.
              </p>
              <p>
                <span className="tick-icon">✔</span> Add credits as a one-time custom payment.
              </p>
              <p>
                <span className="tick-icon">✔</span> No automatic charges - you're in full control.
              </p>
              <p>
                <span className="tick-icon">✔</span> Best for teams with specific usage patterns.
              </p>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>


  );
}
