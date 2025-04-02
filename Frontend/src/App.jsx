import { useState } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Index from "./views/core/Index";
import Detail from "./views/core/Detail";
import Search from "./views/core/Search";
import Category from "./views/core/Category";

import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import Logout from "./views/auth/Logout";
import ForgotPassword from "./views/auth/ForgotPassword";
import CreatePassword from "./views/auth/CreatePassword";
import Dashboard from "./views/dashboard/Dashboard";
import Posts from "./views/dashboard/Posts";

import AddPost from "./views/dashboard/AddPost";
import EditPost from "./views/dashboard/EditPost";
import Comments from "./views/dashboard/Comments";
import Eventbooking from "./views/dashboard/Eventbooking";
import Bookevent from "./views/dashboard/Bookevent";
import Profile from "./views/dashboard/Profile";
import Message from "./views/dashboard/Message";




function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/:slug/" element={<Detail />} />
                    <Route path="/category/" element={<Category />} />
                    <Route path="/search/" element={<Search />} />
                    <Route path="/Message/" element={<Message />} />

                   
                    
                    
                    {/* Authentication */}
                    <Route path="/register/" element={<Register />} />
                    <Route path="/login/" element={<Login />} />
                    <Route path="/logout/" element={<Logout />} />
                    <Route path="/forgot-password/" element={<ForgotPassword />} />
                    <Route path="/create-password/" element={<CreatePassword />} />

                    {/* Dashboard */}
                    <Route path="/dashboard/" element={<Dashboard />} />
                    <Route path="/posts/" element={<Posts />} />
                    
                    <Route path="/add-post/" element={<AddPost />} />
                    <Route path="/edit-post/:id/" element={<EditPost />} />
                    <Route path="/comments/" element={<Comments />} />
                    <Route path="/eventbooking/" element={<Eventbooking/>} />
                    <Route path="/bookevent/" element={<Bookevent/>} />
                    <Route path="/profile/" element={<Profile />} />

                  
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;