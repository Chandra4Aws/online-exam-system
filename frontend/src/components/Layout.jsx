import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f4f6f9', fontFamily: "'Inter',system-ui,sans-serif" }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Navbar />
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    </div>
);

export default Layout;
