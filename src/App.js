import "./css/App.css";
import "./css/Reset.css";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Register from "./pages/Register";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Post from "./pages/Post";

import MyStuff from "./pages/mystuff/MyStuff";

import FlashcardSet from "./pages/flashcards/FlashcardSet";
import EditFlashcards from "./pages/flashcards/EditFlashcards";
import CreateFlashcards from "./pages/flashcards/CreateFlashcards";
import ImportFlashcards from "./pages/flashcards/ImportFlashcards";

import CreateNotes from "./pages/notes/CreateNotes";
import ShowNotes from "./pages/notes/ShowNotes";
import EditNotes from "./pages/notes/EditNotes";

import ShowTag from "./pages/tags/ShowTag";
import AddTag from "./pages/tags/AddTag";
import ShowAllTags from "./pages/tags/ShowAllTags";
import EditTag from "./pages/tags/EditTag";

import SimpleDisplay from "./pages/revision/flashcards/SimpleDisplay";
import Quiz from "./pages/revision/flashcards/Quiz";
import StudyFlashcards from "./pages/revision/study/StudyFlashcards";
import MeteorQuiz from "./pages/revision/meteors/MeteorQuiz";
import SpacedRepetition from "./pages/revision/spacedRepetition/SpacedRepetition";

import PomodoroTimer from "./pages/timers/Pomodoro";
import CreateTimerConfig from "./pages/timers/segments/CreateTimerConfig";
import ExamTimers from "./pages/timers/segments/ExamTimers";
import EditTimerConfig from "./pages/timers/segments/EditTimerConfig";
import ViewTimerConfigs from "./pages/timers/segments/ViewTimerConfigs";
import TimerPage from "./pages/timers/segments/TimerPage";

import ViewWhiteboard from "./pages/whiteboards/ViewWhiteboard";
import PostWhiteboard from "./pages/whiteboards/PostWhiteboard";
import WhiteboardPage from "./pages/whiteboards/ShowWhiteboards";

import CreateTodoList from "pages/todos/CreateTodo";
import ShowTodos from "pages/todos/ShowTodos";
import ViewTodo from "pages/todos/ViewTodo";

import ViewExams from "pages/exams/ViewExams";

import Navbar from "navbar/Navbar";

import { useState } from "react";

function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));
  // this will act as a sitewise marker which tells us if we are logged in or not

  console.log("helo")

  return (
    <div className="mainContainer">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home isAuth={isAuth} />} />
          <Route path="/profile" element={<Profile setIsAuth={setIsAuth} />} />
          <Route
            path="/register"
            element={<Register setIsAuth={setIsAuth} />}
          />
          <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
          <Route path="/mystuff" element={<MyStuff isAuth={isAuth} />} />

          <Route path="/post" element={<Post isAuth={isAuth} />} />

          {/* CRUD for sets, notes and tags */}
          {/* This /set/:setID means that anything after /set will be put through, and this setID argument will be given to the function */}
          <Route
            path="/sets/post"
            element={<CreateFlashcards isAuth={isAuth} />}
          />
          <Route
            path="/sets/import"
            element={<ImportFlashcards isAuth={isAuth} />}
          />
          <Route
            path="/sets/:setID"
            element={<FlashcardSet isAuth={isAuth} />}
          />
          <Route
            path="/sets/:id/edit"
            element={<EditFlashcards isAuth={isAuth} />}
          />

          <Route path="/notes/post" element={<CreateNotes isAuth={isAuth} />} />
          <Route
            path="/notes/:noteID"
            element={<ShowNotes isAuth={isAuth} />}
          />
          <Route
            path="/notes/:noteID/edit"
            element={<EditNotes isAuth={isAuth} />}
          />

          <Route path="/tags/:tagID" element={<ShowTag isAuth={isAuth} />} />
          <Route
            path="/tags/:tagID/edit"
            element={<EditTag isAuth={isAuth} />}
          />
          <Route path="/tags/post" element={<AddTag isAuth={isAuth} />} />
          <Route path="/tags" element={<ShowAllTags isAuth={isAuth} />} />

          {/* all the revision methods */}

          <Route path="/:setID/flashcards" element={<SimpleDisplay />} />
          <Route path="/:setID/quiz" element={<Quiz />} />
          <Route path="/:setID/study" element={<StudyFlashcards />} />
          <Route path="/:setID/meteors" element={<MeteorQuiz />} />
          <Route
            path="/:setID/spacedRepetition"
            element={<SpacedRepetition />}
          />

          {/* timers */}

          <Route path="/timers/pomodoro" element={<PomodoroTimer />} />
          <Route path="/timers/basic" element={<TimerPage />} />
          <Route path="/timers/config/post" element={<CreateTimerConfig />} />
          <Route path="/timers/config" element={<ExamTimers />} />
          <Route
            path="/timers/config/edit/:configID"
            element={<EditTimerConfig />}
          />
          <Route path="/timers" element={<ViewTimerConfigs />} />

          {/* whiteboards */}

          <Route
            path="/whiteboards/:whiteboardID"
            element={<ViewWhiteboard />}
          />
          <Route path="/whiteboards/post" element={<PostWhiteboard />} />
          <Route path="/whiteboards" element={<WhiteboardPage />} />

          {/* todos */}

          <Route
            path="/todos/post"
            element={<CreateTodoList isAuth={isAuth} />}
          />
          <Route path="/todos" element={<ShowTodos isAuth={isAuth} />} />
          <Route path="/todos/:todoID" element={<ViewTodo />}/>

          {/* exam calendar */}

          <Route path="/exams" element={<ViewExams isAuth={isAuth}/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
