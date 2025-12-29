"use client"
import { createContext, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children, plan }) => {
  return <UserContext.Provider value={{ plan }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);