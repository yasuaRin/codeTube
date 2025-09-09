// components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Main Footer Section */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center gap-4">
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
          margin-top: 40px;
          color: white;
        }
        .footer div h3,
        .footer div p {
          color: white;
        }
        .footer-bottom {
          border-top: 1px solid #d1d5db;
          text-align: center;
          color: white;
          font-size: 0.875rem;
          padding: 12px 0;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
