import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reducers/authReducer";
import todoReducer from "../reducers/todoReducer";

export const store = configureStore({
  reducer: {
    user: authReducer,
    todos: todoReducer,
  },
});

// {
//   user:{},   //user ka authentication data jaise id,email,password,token
//   todos:[]   //user ka todo ka data jaise token,id,todo,delete,
// }
