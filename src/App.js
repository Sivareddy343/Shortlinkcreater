import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StatsPageRouter from './statsPageRouter';
import './App.css';

const App=()=> {
  return (
    <div className="App">
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Stats page: /code/:code */}
        <Route path="/code/:code" element={<StatsPageRouter />} />
      </Routes>
    </div>
  );
}
export default App;
