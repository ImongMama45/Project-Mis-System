// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext.jsx';
// import Login from './components/Login.jsx';
// import Register from './components/Register';
// import MaintenanceList from './components/MaintenanceList.jsx';
// import MaintenanceRequestForm from './components/MaintenanceRequestForm.jsx';
// import './App.css';

// function PrivateRoute({ children }) {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? children : <Navigate to="/login" />;
// }

// function PublicRoute({ children }) {
//   const { isAuthenticated } = useAuth();
//   return !isAuthenticated ? children : <Navigate to="/dashboard" />;
// }

// function Navigation() {
//   const { isAuthenticated, logout, user } = useAuth();

//   if (!isAuthenticated) return null;

//   return (
//     <nav className="navbar">
//       <div className="nav-brand">MIS - Maintenance System</div>
//       <div className="nav-links">
//         <span>Welcome, {user?.username}</span>
//         <button onClick={logout} className="btn-logout">Logout</button>
//       </div>
//     </nav>
//   );
// }

// function AppContent() {
//   return (
//     <>
//       <Navigation />
//       <div className="main-content">
//         <Routes>
//           <Route 
//             path="/login" 
//             element={
//               <PublicRoute>
//                 <Login />
//               </PublicRoute>
//             } 
//           />
//           <Route 
//             path="/register" 
//             element={
//               <PublicRoute>
//                 <Register />
//               </PublicRoute>
//             } 
//           />
//           <Route 
//             path="/dashboard" 
//             element={
//               <PrivateRoute>
//                 <MaintenanceList />
//               </PrivateRoute>
//             } 
//           />
//           <Route 
//             path="/submit-request" 
//             element={<MaintenanceRequestForm />} 
//           />
//           <Route path="/" element={<Navigate to="/dashboard" />} />
//         </Routes>
//       </div>
//     </>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <AppContent />
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;