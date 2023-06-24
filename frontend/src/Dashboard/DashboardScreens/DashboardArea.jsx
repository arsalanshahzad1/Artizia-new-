import React from 'react'
import DashboardFront from './DashboardFront'
import { Routes, Route } from 'react-router-dom'
import UserManagement from './UserManagement'
function DashboardArea({ search, setSearch }) {
    return (
        <div>
            <Routes>
                <Route path='/' element={
                    <DashboardFront search={search} setSearch={setSearch} />

                } />
                <Route path='/user-management' element={
                    <UserManagement search={search} setSearch={setSearch} />

                } />
                <Route path='/control-content' element={
                    <div>control-content</div>

                } />
                <Route path='/artwork-management' element={
                    <div>artwork-management</div>

                } />
                <Route path='/analytic-tool' element={
                    <div>analytic-tool</div>

                } />
            </Routes>
        </div>
    )
}

export default DashboardArea