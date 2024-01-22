import './App.css';

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Post from './pages/Post';

import MyStuff from './pages/MyStuff';

import FlashcardSet from './pages/flashcards/FlashcardSet';
import EditFlashcards from './pages/flashcards/EditFlashcards';
import CreateFlashcards from './pages/flashcards/CreateFlashcards';
import ImportFlashcards from "./pages/flashcards/ImportFlashcards"

import CreateNotes from './pages/notes/CreateNotes';
import ShowNotes from './pages/notes/ShowNotes';
import EditNotes from './pages/notes/EditNotes';

import ShowTag from './pages/tags/ShowTag';
import AddTag from './pages/tags/AddTag';
import ShowAllTags from "./pages/tags/ShowAllTags"
import EditTag from './pages/tags/EditTag';

import { useState } from 'react';


function App() {

  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));
  // this will act as a sitewise marker which tells us if we are logged in or not

  return (
    <Router>
      <Link to="/">
        Home
      </Link> 
      {/* This will make it so that profile is shown when you are logged in, else it's login */}
      {isAuth && <Link to="/profile">
        Profile
      </Link>} 
      {!isAuth && <Link to="/login">
        Login
      </Link>} 
      <Link to="/post">
        Post
      </Link> 
      {isAuth && <Link to="/mystuff">
        My Stuff
      </Link>}


      <Routes>
        <Route path="/" element={<Home isAuth={isAuth}/>} />
        <Route path="/profile" element={<Profile setIsAuth={setIsAuth}/>} />
        <Route path="/register" element={<Register setIsAuth={setIsAuth}/>} />
        <Route path="/login" element={<Login setIsAuth={setIsAuth}/>} /> 
        <Route path="/mystuff" element={<MyStuff isAuth={isAuth}/>} />

        <Route path="/post" element={<Post isAuth={isAuth}/>} />

        {/* This /set/:setID means that anything after /set will be put through, and this setID argument will be given to the function */}
        <Route path="/sets/post" element={<CreateFlashcards isAuth={isAuth}/>} />
        <Route path='/sets/import' element={<ImportFlashcards isAuth={isAuth}/>} />
        <Route path='/sets/:setID' element={<FlashcardSet isAuth={isAuth}/>}/>
        <Route path='/sets/:id/edit' element={<EditFlashcards isAuth={isAuth}/>}/>

        <Route path="/notes/post" element={<CreateNotes isAuth={isAuth}/>} />
        <Route path="/notes/:noteID" element={<ShowNotes isAuth={isAuth}/>} />
        <Route path="/notes/:noteID/edit" element={<EditNotes isAuth={isAuth}/>} />

        <Route path="/tags/:tagID" element={<ShowTag isAuth={isAuth}/>} />
        <Route path="/tags/:tagID/edit" element={<EditTag isAuth={isAuth} />} />
        <Route path="/tags/post" element={<AddTag isAuth={isAuth}/>} />
        <Route path="/tags" element={<ShowAllTags isAuth={isAuth} />} />
        
      </Routes>

    </Router>

  );
}

export default App;
