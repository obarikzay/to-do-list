import React, { useState } from "react";
import './App.css'
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add'
import {v4 as uuid} from "uuid"
import Bar from './view/Bar'
import CustomizedDialogs from './view/Dialog'
import {firestore, firebase} from './configuration/firebase-config'

 const fetchData = async (columnId) => {
 const data = await firestore.doc(`columns/${columnId}`).get().then(function (snapshot){
      if(snapshot.exists){
          return snapshot.data()
      }
  })
  console.log('data', data.items)
  return data.items
}
const itemsFromBackend = [
  { id: uuid(), content: "First task" },
  { id: uuid(), content: "Second task" },
  { id: uuid(), content: "Third task" },
  { id: uuid(), content: "Fourth task" },
  { id: uuid(), content: "Fifth task" }
];

const columnsFromBackend = {
  ['Col1']: {
    name: "To do",
    items: itemsFromBackend
  },
  ['Col2']: {
    name: "In Progress",
    items: []
  },
  ['Col3']: {
    name: "Done",
    items: []
  }
};

const onDragEnd = (result, columns, setColumns) => {
  if (!result.destination) return;
  const { source, destination } = result;

  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems
      }
    });
    firestore.doc(`columns/${destination.droppableId}`).update({items: destItems})

    firestore.doc(`columns/${source.droppableId}`).update({items: sourceItems})


  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems
      }
    });
    firestore.doc(`columns/${source.droppableId}`).update({items: copiedItems})
  }
};

const addItem = (columAddedTo, setColumns, text, setText) => {
setColumns(prev =>{
 return{
   ...prev,
   Col1: {
    name: prev.Col1.name,
    items: [
      {
        id: uuid(), 
        content: text
      },
      ...prev.Col1.items
    ]
  }
 }
})

fetchData('Col1') //testing the fetch
  setText('')
}
function App() {
  const [columns, setColumns] = useState(columnsFromBackend);
  const [text, setText] = useState("")
  
  return (
    <div>
    <Bar/>    

    <div>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)}/>
        <Button autoFocus onClick={result => addItem(columns, setColumns, text, setText)} color="secondary" variant="contained">
        <AddIcon/>        
        </Button>
      </div>  
  
    <div style={{ display: "flex", justifyContent: "center", height: "100%" }}>    
      <DragDropContext
        onDragEnd={result => onDragEnd(result, columns, setColumns)}
      >
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
              key={columnId}
            >
              <h2>{column.name}</h2>
              <div style={{ margin: 8 }}>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver
                            ? "pink"
                            : "green",
                          padding: 4,
                          width: 250,
                          minHeight: 500
                        }}
                      >
                        {column.items.map((item, index) => {
                          return (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                return (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      userSelect: "none",
                                      padding: 16,
                                      margin: "0 0 8px 0",
                                      minHeight: "50px",
                                      backgroundColor: snapshot.isDragging
                                        ? "brown"
                                        : "blue",
                                      color: "white",
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    {item.content}
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            </div>
          );
        })}
      </DragDropContext>
    </div>
    </div>
  );
}

export default App;
