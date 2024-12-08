import React from "react";
import Header from "../components/Header.tsx";
import PageTransition from "../components/PageTransition.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faReact, 
  faPython, 
  faJs, 
  faNodeJs,
  faCss3Alt,
  faSwift,
  faUnity
} from "@fortawesome/free-brands-svg-icons";
import { faDesktop, faCode } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

const About: React.FC = () => {
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
              about me
            </h1>

            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-500 mb-4">
                Who am I?
              </h2>
              <p className="text-gray-400 mb-6">
                I'm a passionate full-stack developer with a love for creating elegant solutions 
                to complex problems. Based in Atlanta, I specialize in web development and 
                backend programming.
              </p>
            </div>

            {/* Skills Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-500 mb-4">
                Tech Stack
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                <div className="bg-purple-500 bg-opacity-20 rounded-lg p-10">
                  <h3 className="text-white font-semibold mb-2">Frontend</h3>
                  <div className="flex justify-center space-x-8 p-4">
                    <a href="https://react.dev" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faReact}
                        className="h-16 w-16 text-white transition-all duration-500"
                      />
                    </a>
                    <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faJs}
                        className="h-12 w-12 text-white transition-all duration-500"
                      />
                    </a>
                    <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faCss3Alt}
                        className="h-12 w-12 text-white transition-all duration-500"
                      />
                    </a>
                  </div>
                </div>
                <div className="bg-purple-500 bg-opacity-20 rounded-lg p-10">
                  <h3 className="text-white font-semibold mb-2">Backend</h3>
                  <div className="flex justify-center space-x-8 p-4">
                    <a href="https://www.python.org" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faPython}
                        className="h-12 w-12 text-white transition-all duration-500"
                      />
                    </a>
                    <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faNodeJs}
                        className="h-12 w-12 text-white transition-all duration-500"
                      />
                    </a>
                    <a href="https://isocpp.org" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faCode}
                        className="h-12 w-12 text-white transition-all duration-500"
                      />
                    </a>
                    <a href="https://www.rust-lang.org" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faCode}
                        className="h-12 w-12 text-white transition-all duration-500"
                      />
                    </a>
                  </div>
                </div>
                <div className="bg-purple-500 bg-opacity-20 rounded-lg p-10">
                  <h3 className="text-white font-semibold mb-2">Learning</h3>
                  <div className="flex justify-center space-x-8 p-4">
                    <a href="https://www.electronjs.org" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faDesktop}
                        className="h-12 w-12 text-white transition-all duration-500"
                      />
                    </a>
                    <a href="https://unity.com" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faUnity}
                        className="h-12 w-12 text-white transition-all duration-500"
                      />
                    </a>
                    <a href="https://developer.apple.com/swift" target="_blank" rel="noopener noreferrer"
                       className="hover:text-purple-400 transition-all">
                      <FontAwesomeIcon
                        icon={faSwift}
                        className="h-12 w-12 text-white transition-all duration-500"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Focus */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-500 mb-4">
                Current Focus
              </h2>
              <p className="text-gray-400">
                I'm currently diving deep into desktop application development using Electron,
                while continuing to expand my knowledge in web technologies and backend systems.
              </p>
            </div>

            {/* Call to Action Button */}
            <NavLink to="/projects">
              <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-md transition-opacity duration-300">
                View My Projects
              </button>
            </NavLink>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

export default About; 