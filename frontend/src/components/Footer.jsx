// components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Main Footer Section */}
      <div className="footer-main max-w-6xl mx-auto px-6 py-8 flex flex-col items-center gap-4">
        {/* About */}
        <div className="w-full text-center">
          <h3 className="font-semibold text-xl mb-2">About CodeTube</h3>
          <p className="text-base max-w-2xl mx-auto mb-2">
            CodeTube is a mini project that helps users find coding tutorials to enhance their skills.
          </p>
          <p className="text-sm italic">
            Future enhancements may be added as time permits.
          </p>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} CodeTube. All rights reserved.
      </div>

      <style>{`
        .footer {
          background-color: #282c34;
          border-top: 2px solid #060707;
          border-radius: 12px 12px 0 0;
          color: white;
          width: 100%;
        }
        .footer div h3,
        .footer div p {
          color: white;
        }
        .footer-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1.5rem;
        }
        .footer-bottom {
          border-top: 1px solid #d1d5db;
          text-align: center;
          color: white;
          font-size: 0.875rem;
          padding: 12px 0;
          width: 100%;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .footer-main {
            padding: 1.5rem 1rem;
          }
          .footer-main h3 {
            font-size: 1.1rem;
          }
          .footer-main p {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 768px) {
          .footer-main {
            padding: 1rem 0.75rem;
          }
          .footer-main h3 {
            font-size: 1rem;
          }
          .footer-main p {
            font-size: 0.9rem;
          }
          .footer-bottom {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .footer-main {
            padding: 0.75rem 0.5rem;
          }
          .footer-main h3 {
            font-size: 0.95rem;
          }
          .footer-main p {
            font-size: 0.85rem;
          }
          .footer-bottom {
            font-size: 0.75rem;
            padding: 10px 0;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
