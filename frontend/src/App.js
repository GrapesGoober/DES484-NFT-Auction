import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HostView from "./components/Hostview.js";
import BidderView from "./components/BidderView.js";

function App() {
  return (
    <Router>
      <div>
        <h1>NFT Marketplace with Auctions</h1>
        <nav>
          <Link to="/host">Host View</Link> | <Link to="/bidder">Bidder View</Link>
        </nav>
        <Routes>
          <Route path="/host" element={<HostView />} />
          <Route path="/bidder" element={<BidderView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
