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
import './App.css';
import { Breadcrumb, Layout, Menu } from 'antd';
import React from 'react';
import ProposePage  from './pages/propose';
import FinishPage from './pages/FinishPropo';
import { Divider, Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer,Sider } = Layout;


const App: React.FC = () => (
 
<Layout className="layout">
<Header title='社团管理' >


  < div className="logo"  >
      
<h1>title</h1>
  </div>
  <Menu
    theme="dark"
    mode="horizontal"
    defaultSelectedKeys={['2']}

  >
        <Menu.Item key="1" >投票</Menu.Item>
        <Menu.Item key="2">查看投票结果</Menu.Item>
        <Menu.Item key="3">查看个人信息</Menu.Item>
        </Menu>
</Header>
<Content style={{ padding: '0 50px' }}>
  {/* <Breadcrumb style={{ margin: '16px 0' }}>
    <Breadcrumb.Item>Home</Breadcrumb.Item>
    <Breadcrumb.Item>List</Breadcrumb.Item>
    <Breadcrumb.Item>App</Breadcrumb.Item>
  </Breadcrumb> */}
  <div className="site-layout-content">
  <ProposePage/>
  <FinishPage/>
  </div>

</Content>
<Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
</Layout>
  
);











export default App
