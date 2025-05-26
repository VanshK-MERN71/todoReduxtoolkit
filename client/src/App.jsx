import { useEffect } from 'react'
import './App.css'
import Auth from './components/Auth'
import Todo from "./components/Todo"
import {useSelector,useDispatch} from "react-redux"
import {addToken} from "./reducers/authReducer"


function App() {
   const dispatch = useDispatch();
   const token = useSelector((state)=>state.user.token);

     useEffect(()=>{
       dispatch(addToken())
     },[])
     
  return (
    <div className='App'>

      {
        token ? <Todo/> : <Auth/>
      }
     
      
    </div>
  )
}

export default App
