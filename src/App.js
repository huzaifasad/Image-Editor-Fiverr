// import React from 'react'
// import Dashboard from './Comp/Dashboad'
// import { BrowserRouter , Routes, Route} from 'react-router-dom';
// import Friends from './Comp/Friends';

// export default function App() {
//   return (
//     <BrowserRouter>
//        <Routes>
//         <Route path='/' element={<Dashboard/>}/>
//         <Route path='/friends' element={<Friends/>}/>
//        </Routes>
     
//     </BrowserRouter>
//   )
// }
import React from 'react'
// import Register from './Comp/Register'
// import Apps from './Comp/Apps'
// import Editor from './Editor'
import ImageEditor from './ImageEditor'
export default function App() {
  return (
    <div>
     {/* <Register/> */}
     <ImageEditor/>
   
    </div>
  )
}
