import React from 'react';
import Header from '../components/Header';
import PageTransition from '../components/PageTransition';

const Projects: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col bg-custom-pattern bg-cover bg-center bg-opacity-40 p-12">
      <div className="pt-12">
        <p>f</p>
      </div>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex items-center justify-center flex-grow">
        <PageTransition>
          <div className="text-center bg-black bg-opacity-80 p-10 rounded-lg shadow-lg max-w-3xl w-full">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
              projects
            </h1>
            
            {/* Coming Soon Message */}
            <div className="mt-12">
              <p className="text-gray-400 text-lg p-10">
                unfortunately, I don't have any notable projects to show yet, as most of them are private and not open source. 
                i am currently working on a few projects that will be released soon, so keep a look out for them! for now, you can check out my github.
              </p>
              <a href="https://github.com/Roshan-Rengadurai" target="_blank" rel="noopener noreferrer">
                <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-md transition-opacity duration-300 p-10">
                  View My Github
                </button>
              </a>
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

export default Projects;
