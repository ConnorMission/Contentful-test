import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/post/:id" element={<BlogPost />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <footer>
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Contentful Integration. Built with React by Connor.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
