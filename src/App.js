import React, { Component } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuid } from "uuid"
import Bar from './view/Bar'
import { firestore, firebase } from './configuration/firebase-config'
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';



export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: {
        Col1: {
          name: "To do",
          items: []
        },
        Col2: {
          name: "In Progress",
          items: []
        },
        Col3: {
          name: "Done",
          items: []
        }
      }
    }
  }
  async componentDidMount() {
    const dataCol1 = await this.fetchData("Col1")
    const dataCol2 = await this.fetchData("Col2")
    const dataCol3 = await this.fetchData("Col3")
    this.setState({
      columns: {
        Col1: dataCol1,
        Col2: dataCol2,
        Col3: dataCol3
      }
    })
  }

  fetchData = async (columnId) => {
    const data = await firestore.doc(`columns/${columnId}`).get().then(function (snapshot) {
      if (snapshot.exists) {
        return snapshot.data()
      }
    })
    return data
  }


  onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = this.state.columns[source.droppableId];
      const destColumn = this.state.columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      this.setState({
        columns: {
          ...this.state.columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems
          },
          [destination.droppableId]: {
            ...destColumn,
            items: destItems
          }
        }
      });
      firestore.doc(`columns/${destination.droppableId}`).update({ items: destItems })

      firestore.doc(`columns/${source.droppableId}`).update({ items: sourceItems })


    } else {
      const column = this.state.columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      this.setState({
        columns: {
          ...this.state.columns,
          [source.droppableId]: {
            ...column,
            items: copiedItems
          }
        }
      });

      firestore.doc(`columns/${source.droppableId}`).update({ items: copiedItems })
    }
  };

  handleTaskCreate = (task) => {
    const newItems = [
      ...this.state.columns[task.columnAddedTo].items,
      { id: uuid(), content: task.text }]

    this.setState({
      columns: {
        ...this.state.columns,
        [task.columnAddedTo]: {
          ...this.state.columns[task.columnAddedTo],
          items: newItems
        }
      }
    });
    firestore.doc(`columns/${task.columnAddedTo}`).update({ items: newItems })
  }

  handleDeleteTask(columnId, itemId) {
    const newItems = this.state.columns[columnId].items.filter(ex => ex.id !== itemId)
    this.setState({
      columns: {
        ...this.state.columns,
        [columnId]: {
          ...this.state.columns[columnId],
          items: newItems
        }
      }
    })
    firestore.doc(`columns/${columnId}`).update({ items: newItems })
  }

  render() {
    return (
      <div>
        <Bar
          onTaskCreate={this.handleTaskCreate}
        />
        <div style={{ display: "flex", justifyContent: "center", height: "100%" }}>
          <DragDropContext
            onDragEnd={result => this.onDragEnd(result)}
          >
            {Object.entries(this.state.columns).map(([columnId, column], index) => {
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
                                ? "green"
                                : "lightBlue",
                              padding: 4,
                              width: 500,
                              minHeight: 750
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
                                            : "#222222",
                                          color: "white",
                                          ...provided.draggableProps.style
                                        }}
                                      >
                                        <ListItem>
                                          <ListItemText
                                            primary={item.content}
                                          />
                                          <IconButton onClick={() => this.handleDeleteTask(columnId, item.id)}style={{color: "white"}}>
                                            <DeleteIcon />
                                          </IconButton>

                                        </ListItem>
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
    )
  }
}

