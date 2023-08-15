import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-8 w-full items-center p-4 pt-16">
      <Helmet>
        <title>Auscultation Database</title>
      </Helmet>
      <p className="text-3xl text-center">Auscultation Database</p>
      <div className="card lg:card-side bg-base-300 shadow-xl">
        <figure className="bg-base-content">
          <svg
            width="64px"
            height="64px"
            viewBox="0 0 24 24"
            fill="none"
            className="m-4"
          >
            <path
              opacity="0.5"
              d="M2.34594 11.2501C2.12458 10.5866 2 9.92019 2 9.26044C2 3.3495 7.50016 0.662637 12 5.49877C16.4998 0.662637 22 3.34931 22 9.2604C22 9.92017 21.8754 10.5866 21.6541 11.2501H18.6361L18.5241 11.25C17.9784 11.2491 17.4937 11.2483 17.0527 11.4447C16.6116 11.6411 16.2879 12.002 15.9233 12.4084L15.8485 12.4918L14.8192 13.6354C14.7164 13.7496 14.5379 13.7463 14.4401 13.6277L10.8889 9.32318C10.7493 9.15391 10.6 8.97281 10.454 8.8384C10.2839 8.68188 10.0325 8.50581 9.68096 8.4847C9.32945 8.46359 9.05875 8.60829 8.87115 8.74333C8.71006 8.8593 8.54016 9.02123 8.38136 9.17258L6.85172 10.6294C6.37995 11.0787 6.28151 11.1553 6.17854 11.1964C6.07557 11.2376 5.9515 11.2501 5.3 11.2501H2.34594Z"
              fill="#1C274C"
            />
            <path
              d="M21.6538 11.2499H18.6359L18.5239 11.2497C17.9781 11.2489 17.4935 11.2481 17.0524 11.4445C16.6114 11.6409 16.2876 12.0018 15.9231 12.4082L15.8482 12.4915L14.819 13.6352C14.7162 13.7494 14.5377 13.7461 14.4399 13.6275L10.8886 9.32297C10.7491 9.1537 10.5998 8.9726 10.4537 8.83819C10.2837 8.68166 10.0322 8.5056 9.68072 8.48449C9.32922 8.46337 9.05852 8.60808 8.87092 8.74312C8.70983 8.85908 8.53993 9.02101 8.38113 9.17236L6.85149 10.6292C6.37972 11.0785 6.28128 11.155 6.17831 11.1962C6.07534 11.2374 5.95126 11.2499 5.29977 11.2499H2.3457C3.38166 14.3548 6.5372 17.3936 8.9615 19.3705C10.2935 20.4567 10.9595 20.9998 11.9998 20.9998C13.0401 20.9998 13.7061 20.4567 15.038 19.3705C17.4623 17.3936 20.6179 14.3548 21.6538 11.2499Z"
              fill="#1C274C"
            />
          </svg>
        </figure>
        <div className="card-body">
          <h2 className="card-title">Heart Sounds</h2>
          <p>From the CirCor DigiScope Phonocardiogram dataset</p>
          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/heart')}
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
