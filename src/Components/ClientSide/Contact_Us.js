import React, { useEffect } from 'react';
import '../../Css_Folder/ContactModal.css'; 

const ContactModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  if (!isOpen) return null;
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content-box">
        <span className="modal-close-btn" onClick={onClose}>&times;</span>
        <h2>Contact Us</h2>
        <p>Choose your preferred way to reach us:</p>
        
        <div className="contact-options">
          <a href="https://wa.me/message/Y2LJ2VUONSEOF1" target="_blank" rel="noopener noreferrer">
            <i class="fa-brands fa-square-whatsapp"></i>WhatsApp
          </a>
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=aireasetravels5@gmail.com" target="_blank" rel="noopener noreferrer">
         <i className="fa-solid fa-envelope"/>Email
          </a>
          <a href="tel:+923259422154">
            <i className="fa-solid fa-phone" />Call
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;