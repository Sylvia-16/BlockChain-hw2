// import React from 'react';
// import './App.css';
// import ProposePage from './pages/propose';

// function App() {
//   return (
//     <div className="App">
//       <ProposePage/>
//     </div>
//   );
// }

import { Breadcrumb, Layout, Menu } from 'antd';
import React from 'react';
import ProposePage  from './pages/propose';
const { Header, Content, Footer } = Layout;

const App: React.FC = () => (
 
   <div className='App'>
    
        <ProposePage/>
        {/* <TablePage/> */}
        </div>
     
  
);











export default App
