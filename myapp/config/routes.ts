export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/Login',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/welcome',
    name: '投票',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/results',
    name: '查看投票结果',
    icon: 'crown',
    component: './VoteResults',
  },
  {
    name: '查看个人信息',
    icon: 'table',
    path: '/list',
    component: './TableList',
  },

  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
