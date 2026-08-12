import React from 'react';
import '../../Css_Folder/PageLoader.css';

const PageLoader = ({ label = 'Loading...', fullPage = true, inline = false }) => (
  <div
    className={[
      'page-loader',
      fullPage && !inline ? 'page-loader--full' : '',
      inline ? 'page-loader--inline' : '',
    ].filter(Boolean).join(' ')}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className="page-loader-spinner" aria-hidden="true" />
    <p className="page-loader-label">{label}</p>
  </div>
);

export default PageLoader;
