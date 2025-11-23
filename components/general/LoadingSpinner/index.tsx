import React from 'react';
import s from './style.module.scss';

const LoadingSpinner: React.FC = () => {
  return (
    <div className={s.loadingOverlay}>
      <div className={s.spinner}></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
