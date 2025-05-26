import {useState,useEffect} from 'react'
import {useDispatch,useSelector} from 'react-redux'
import {createTodo,fetchTodo,deleteTodo} from "../reducers/todoReducer"
import {logout} from "../reducers/authReducer"
function Todo() {
     const [mytodo,setTodo] = useState("");
    
     const dispatch= useDispatch();
    
     const addTodo = ()=>{
            dispatch(createTodo({todo:mytodo}))
     }
    const todos = useSelector(state => state.todos)

   useEffect(()=>{
    dispatch(fetchTodo())
   },[])
  return (
    <div>
        <input
             placeholder="write todo here"
             value={mytodo}
             onChange={(e)=>setTodo(e.target.value)}
            />
             <button className="btn #ff4081 pink accent-2" onClick={()=>addTodo() }>Add todo</button>
             <ul className="collection">
                             {
                                 todos.map(item=>{
                                     return  <li className="collection-item" style={{color:"black"}} key={item._id}
                                     onClick={()=>dispatch(deleteTodo(item._id))}
                                     >{item.todo}</li>
                                 })
                             }
            </ul>
              <button className="btn #ff4081 pink accent-2" onClick={()=>dispatch(logout()) }>Log Out</button>
    </div>
  )
}

export default Todo