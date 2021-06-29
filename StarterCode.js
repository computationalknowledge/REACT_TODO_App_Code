fakeApi.js file

//fake data

const todos = ["Go to the store", "Write", "Code"];

//simulate api calls with a function to delay requests
function wait(timeInMS) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMS);
  });
}

export async function getTodos() {
  await wait(300);
  return [...todos];
}

export async function addTodo(todoDescription) {
  await wait(300);
  todos.push(todoDescription);
}

export async function removeTodo(index) {
  await wait(300);
  todos.splice(index, 1);
}


// Writing Code for Custom Hooks that Use React-Query
Time to get to the crux of this lab: Learning how to use React-Query in a project to fetch and mutate data from an API.
Let’s start by taking a look at the code for the useGetTodos.js file.


import { useQuery } from "react-query";
import { getTodos } from "../fakeApi";

export const useGetTodos = () => useQuery("todos", getTodos);


// The code for the useAddTodo.js file.
import { useQueryClient, useMutation } from "react-query";
import { addTodo } from "../fakeApi";

export const useAddTodo = () => {
  const queryClient = useQueryClient();

  return useMutation((todoDescription) => addTodo(todoDescription), {
    onSuccess: () => {
      queryClient.invalidateQueries("todos");
    },
  });
};



// useRemoveTodo.js file:
import { useMutation, useQueryClient } from "react-query";
import { removeTodo } from "../fakeApi";

export const useRemoveTodo = () => {
  const queryClient = useQueryClient();

  return useMutation((index) => removeTodo(index), {
    onSuccess: () => {
      queryClient.invalidateQueries("todos");
    },
  });
};


// index.js
Connecting React-Query to our UI
We will be using Material-UI to style our App. Don’t worry if you are not familiar with Material-UI because it will in no way affect your ability to understand what we are doing with React-Query. Without further ado, let’s set up our UI.
The first step is to wrap our app in the React Query Provider. 

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);


With our project now ready to handle React-Query. Let’s write the UI for our App. Below is the code for our App.js file.

// app.js file:
import { useState } from "react";
import {
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  CircularProgress,
  TextField,
  Typography,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

import { useAddTodo } from "./hooks/useAddTodo";
import { useGetTodos } from "./hooks/useGetTodos";
import { useRemoveTodo } from "./hooks/useRemoveTodo";

function App() {
  //React State
  const [todoInputText, setTodoInputText] = useState("");

  // React-Query Custom Hooks
  const { data, isLoading, isFetching } = useGetTodos();
  const removeMutation = useRemoveTodo();
  const addMutation = useAddTodo();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    );
  } else {
    return (
      <Container maxWidth="xs">
        <List>
          {isFetching && (
            <Typography variant="h5">Fetching New Data...</Typography>
          )}
          {data.map((todoDescription, index) => (
            <ListItem key={index}>
              <ListItemText>{todoDescription}</ListItemText>
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => {
                    removeMutation.mutate(index);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <TextField
          label="Todo Description"
          fullWidth
          variant="outlined"
          value={todoInputText}
          onChange={(e) => setTodoInputText(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => {
            if (todoInputText.length > 1) {
              addMutation.mutate(todoInputText);
              setTodoInputText("");
            }
          }}
        >
          Add Todo
        </Button>
      </Container>
    );
  }
}

export default App;


Go ahead and give it a shot by running the below command.

npm start
