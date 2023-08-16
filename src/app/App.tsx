import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import HeartSvg from './heart.svg';
import LungsSvg from './lungs.svg';

const links = [
  {
    icon: <img src={HeartSvg} />,
    title: 'Heart Sounds',
    description: 'From the CirCor DigiScope Phonocardiogram Dataset',
    link: '/heart',
  },
  {
    icon: <img src={LungsSvg} />,
    title: 'Breath Sounds',
    description: 'From the Respiratory Sound Database',
    link: '/breath',
  },
];

export default function App() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-8 w-full items-center p-8">
      <Helmet>
        <title>Auscultation Database</title>
      </Helmet>
      <div className="text-sm breadcrumbs flex justify-center w-full">
        <ul>
          <li>
            <a href="https://lysine-med.hf.space/">Med</a>
          </li>
          <li>Auscultation</li>
        </ul>
      </div>
      <p className="text-3xl text-center">Auscultation Database</p>
      <p>Auscultation practice with annotated sound tracks.</p>
      <div className="flex flex-col gap-8 items-stretch">
        {links.map(link => (
          <div
            key={link.title}
            className="card sm:card-side bg-base-300 shadow-xl w-full sm:min-w-[500px]"
          >
            <figure className="bg-base-content p-4">{link.icon}</figure>
            <div className="card-body">
              <h2 className="card-title">{link.title}</h2>
              <p>{link.description}</p>
              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    link.link.startsWith('http')
                      ? (window.location.href = link.link)
                      : navigate(link.link)
                  }
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
