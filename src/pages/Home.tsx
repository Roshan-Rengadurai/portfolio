import React from "react";
import Header from "../components/Header.tsx";

const Home: React.FC = () => {
  return (
      <div className="min-h-screen bg-slate-900 bg-custom-bg flex flex-col bg-custom-pattern bg-cover bg-center p-12">
        <div className="pt-12">
          <p>f</p>
        </div>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex items-center justify-center flex-grow">
          <div className="animate-appear text-center bg-black bg-opacity-80 p-10 rounded-lg shadow-lg max-w-3xl w-full">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              fullstack dev, student, and creator.
            </h1>
            <p className="text-gray-400 mb-8">
              Roshan Rengadurai is an aspiring full stack developer based in the
              metropolitan Atlanta area. He is currently experienced with
              certain backend programming languages such as Python and
              Javascript, as well as web development. He is currently learning
              desktop app frameworks (electron) in order to create his very own
              app!
            </p>
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-md transition-opacity duration-300">
              HMU!
            </button>
          </div>
        </div>
      </div>
  );
};

export default Home;

