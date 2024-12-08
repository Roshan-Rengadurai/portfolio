import React from "react";
import Header from "../components/Header.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col bg-custom-pattern bg-cover bg-center bg-opacity-40 p-12">
      <div className="pt-12">
        <p>l</p>
      </div>
      {/* Header */}
      <Header />

      <div className="flex items-center justify-center flex-grow">
        <div className="text-center bg-black bg-opacity-80 p-10 rounded-lg shadow-lg max-w-3xl w-full">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            want to connect?
          </h1>


          {/* GitHub Button */}
          <a
            href="https://github.com/roshan-rengadurai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center mb-8 space-x-4 hover:text-purple-400 transition-all"
          >
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-md transition-all duration-500 flex items-center">
              <FontAwesomeIcon
                icon={faGithub}
                className="text-white h-8 w-8 hover:text-purple-400"
              />
              <span className="ml-6">roshan-rengadurai</span>
            </button>

          </a>

          {/* Instagram Button */}
          <a
            href="https://instagram.com/roshanrengadurai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center mb-8 space-x-4 hover:text-purple-400 transition-all"
          >
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-md transition-all duration-500 flex items-center">
              <FontAwesomeIcon
                icon={faInstagram}
                className="text-white h-8 w-8 hover:text-purple-400"
              />
              <span className="ml-2">@roshanrengadurai</span>
            </button>
          </a>

          {/* LinkedIn Button */}
          <a
            href="https://www.linkedin.com/in/roshan-rengadurai-22601a2b2/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center mb-8 space-x-4 hover:text-purple-400 transition-all"
          >
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-md transition-all duration-500 flex items-center">
              <FontAwesomeIcon
                icon={faLinkedin}
                className="text-white h-8 w-8 hover:text-purple-400"
              />
              <span className="ml-2">Roshan Rengadurai</span>
            </button>
          </a>
          <div className="pt-6 pb-5"><p></p></div>

          {/* TypeForm */}
          <a
            href="https://tovdp38igop.typeform.com/to/mlhMR1ff"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center mb-8 space-x-4 hover:text-purple-400 transition-all"
          >
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-md transition-opacity duration-500">
                Intrested in a Business Venture? Message Me!
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;

// https://tovdp38igop.typeform.com/to/mlhMR1ff