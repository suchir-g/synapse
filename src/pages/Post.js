import React from 'react'
import {Link, useNavigate} from "react-router-dom"

const Post = ({isAuth}) => {
    const navigate = useNavigate()

    if (!isAuth) {navigate("/")}
    return (
        <div>
            <Link to="/sets/post">Flashcards</Link>
            <Link to="/notes/post">Notes</Link>
            <Link to="/tags/post">Tags</Link>
        </div>
    )
}

export default Post