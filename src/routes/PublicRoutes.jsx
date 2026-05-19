import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoutes = () => {
  const { userInfo } = useSelector(state => state.auth || {});
  
  return userInfo ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoutes;
