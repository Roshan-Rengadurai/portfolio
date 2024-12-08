import { Link } from 'react-router-dom';
import React from "react";
import Header from "../components/Header.tsx"; 

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col bg-custom-pattern bg-cover bg-center bg-opacity-40 p-12">
      <div className="pt-12">
        <p>l</p>
      </div>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex items-center justify-center flex-grow">
        <div className="text-center bg-black bg-opacity-80 p-10 rounded-lg shadow-lg max-w-3xl w-full">
            <div><h1 className='text-5xl md:text-6xl font-bold text-white mb-8'>404 PAGE NOT FOUND</h1></div>
            <button className='bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-md transition-opacity duration-300'>
            <h1 className="flex flex-col gap-2 text-white">
                
                <Link to="/">Home</Link></h1></button>
        </div>
      </div>
    </div>
    
  );
};


export default NotFoundPage;

