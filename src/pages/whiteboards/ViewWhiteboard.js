import React from 'react'
import Whiteboard from './Whiteboard'
import { useParams } from 'react-router-dom'

const ViewWhiteboard = () => {

  const { whiteboardID } = useParams(); 
  return (
    <div>
        <h1>View Whiteboard</h1>
        <Whiteboard whiteboardID={whiteboardID}/>
    </div>
  )
}

export default ViewWhiteboard