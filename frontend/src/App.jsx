import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import QuestionList from './pages/QuestionBank/QuestionList';
import QuestionForm from './pages/QuestionBank/QuestionForm';
import ExamList from './pages/Exam/ExamList';
import ExamBuilder from './pages/Exam/ExamBuilder';
import TestPlayer from './pages/Test/TestPlayer';
import ResultList from './pages/Results/ResultList';
import ResultView from './pages/Results/ResultView';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="questions" element={<QuestionList />} />
            <Route path="questions/new" element={<QuestionForm />} />
            <Route path="questions/edit/:id" element={<QuestionForm />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="exams/new" element={<ExamBuilder />} />
            <Route path="exams/edit/:id" element={<ExamBuilder />} />
            <Route path="results" element={<ResultList />} />
            <Route path="results/:id" element={<ResultView />} />
          </Route>
          <Route
            path="/test/:id"
            element={
              <PrivateRoute>
                <TestPlayer />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
