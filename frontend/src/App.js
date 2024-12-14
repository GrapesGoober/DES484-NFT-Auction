import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HostView from "./components/Hostview.js";
import BidderView from "./components/BidderView.js";
import coinImage from './picture/coin.png';
import './App.css';

function App() {
  return (
    <Router>
      <div
        className="App-container"
        style={{
          backgroundImage: `url(${coinImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Routes>
          {/* Homepage */}
          <Route
            path="/"
            element={
              <div className="App-content">
                <h1>NFT Marketplace with Auctions</h1>
                <nav>
                  <Link to="/host" className="button-link">Host View</Link>
                  <Link to="/bidder" className="button-link">Bidder View</Link>
                </nav>
              </div>
            }
          />
          {/* Other Pages */}
          <Route path="/host" element={<HostView />} />
          <Route path="/bidder" element={<BidderView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
