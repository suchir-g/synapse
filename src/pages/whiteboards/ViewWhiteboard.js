import React from 'react'
import Whiteboard from './Whiteboard'
import { useParams } from 'react-router-dom'

const ViewWhiteboard = () => {

  const { whiteboardID } = useParams(); 
  return (
    <div>
        <Whiteboard whiteboardID={whiteboardID}/>
    </div>
  )
}

export default ViewWhiteboard