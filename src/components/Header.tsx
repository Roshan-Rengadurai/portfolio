import React from "react";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="flex justify-between flex-col md:items-center md:w-[60%] cursor-pointer gap-9 md:flex md:flex-row md:gap-0 text-[1.4rem] bg-[#0F0F10] mt-6 md:mt-0 p-6 md:rounded-full md:justify-between mx-auto rounded-[18px] border-[0.67px] border-primaryBorderColor">
      <NavLink to="/" end>
        <div className="flex items-center space-x-5">
          {/* Logo (Circular and Rounded) */}
          <div className="bg-white rounded-full h-10 w-10 flex items-center justify-center">
            <span className="text-black font-bold">P</span>
          </div>
          <h1 className="text-white text-lg font-semibold">Roshan's Portfolio</h1>
        </div>
      </NavLink>
      {/* End of Logo + Name */}
      <nav className="flex space-x-7">
        {/* <a href="" className="text-gray-400 hover:text-white transition-all duration-300"> */}
        <NavLink className="text-gray-400 hover:text-white transition-all duration-300" to="/projects" end> 
          Projects
        </NavLink>
        <NavLink className="text-gray-400 hover:text-white transition-all duration-300" to="/about" end>
          About Me
        </NavLink>
        <NavLink className="text-gray-400 hover:text-white transition-all duration-300" to="/contact" end>
          Contact Me
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
