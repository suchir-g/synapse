import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from "../../config/firebase";
import { collection, query, getDocs, where, doc, getDoc } from "firebase/firestore";
import { sanitizeAndTruncateHtml } from '../../utilities';



const ShowTag = ({isAuth}) => {

  const navigate = useNavigate();

  const { tagID } = useParams();
  const [tagData, setTagData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [relatedSets, setRelatedSets] = useState([]);
  const [relatedNotes, setRelatedNotes] = useState([]);

  const [childTags, setChildTags] = useState([]);

  useEffect(() => {
    const fetchTagData = async () => {
      try {
        // get the tag document by ID
        const tagDocRef = doc(db, "tags", tagID);
        const tagDocSnap = await getDoc(tagDocRef);

        if (tagDocSnap.exists()) {
          const tag = tagDocSnap.data();
          setTagData(tag);

          // query flashcard sets with this tag
          const setsQuery = query(collection(db, "flashcardSets"), where("tags", "array-contains", tagID));
          const setsSnapshot = await getDocs(setsQuery);
          const fetchedSets = setsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRelatedSets(fetchedSets);

          // query notes with this tag
          const notesQuery = query(collection(db, "notes"), where("tags", "array-contains", tagID));
          const notesSnapshot = await getDocs(notesQuery);
          const fetchedNotes = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRelatedNotes(fetchedNotes);

          // fetch child tags if any
          // remember that it dosen't have to have any children (leaf node)
          if (tag.childTags) {
            const childTagsPromises = tag.childTags.map(childTagId => getDoc(doc(db, "tags", childTagId)));
            const childTagsDocs = await Promise.all(childTagsPromises);
            setChildTags(childTagsDocs.filter(docSnap => docSnap.exists()).map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
          }
        } else {
          console.error("Tag not found");
        }
      } catch (error) {
        console.error("Error fetching tag data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTagData();
  }, [tagID]);

  const handleAddChildTag = () => {
    navigate('/tags/post', { state: { isAuth: isAuth, parentTagID: tagID } });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tagData) {
    return <div>Tag not found</div>;
  }

  return (
    <div>
      <h1>Tag: {tagData.tagName}</h1>
      {tagData.parentTag && (
        <div>Parent Tag: <Link to={`/tags/${tagData.parentTag}`}>Back to Parent Tag</Link></div>
      )}

      <section>
        <h2>Flashcard Sets</h2>
        {relatedSets.length > 0 ? (
          relatedSets.map(set => (
            <div key={set.id}>
              <h3><Link to={`/sets/${set.id}`}>{set.title}</Link></h3>
              <p>{set.description}</p>
            </div>
          ))
        ) : (
          <p>No flashcard sets found for this tag.</p>
        )}
      </section>

      <section>
        <h2>Notes</h2>
        {relatedNotes.length > 0 ? (
          relatedNotes.map(note => (
            <div key={note.id}>
              <h3><Link to={`/notes/${note.id}`}>{note.title}</Link></h3>
              {/* Render content or a summary */}
              <p>{sanitizeAndTruncateHtml(note.content)}</p>
            </div>
          ))
        ) : (
          <p>No notes found for this tag.</p>
        )}
      </section>

      <section>
        <h2>Child Tags</h2>
        {childTags.length > 0 ? (
          childTags.map(childTag => (
            <div key={childTag.id}>
              <Link to={`/tag/${childTag.id}`}>{childTag.tagName}</Link>
            </div>
          ))
        ) : (
          <p>No child tags found.</p>
        )}
        <button onClick={handleAddChildTag}>Add New Child Tag</button>
      </section>
    </div>
  );
}

export default ShowTag;
