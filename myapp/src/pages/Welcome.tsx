import { CalculatorOutlined } from '@ant-design/icons';
import { getFieldPropsOrFormItemProps, PageContainer } from '@ant-design/pro-components';
import { Button } from 'antd';
import { InputNumber } from 'antd';
import { Space, Table } from 'antd';
import { Form, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { proposeContract, stuERC20Contract, stuERC721Contract, web3 } from '../utils/contracts';
import './Welcome.less';

const GanacheTestChainId = '0x539'; // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain';
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545';
// eslint-disable-next-line
const ProposePage = () => {
  const [account, setAccount] = useState('');
  const [accountBalance, setAccountBalance] = useState(0);
  const [propoNum, setPropoNum] = useState(0);
  const [JoinClub, setJoinClub] = useState(0);
  const [playAmount, setPlayAmount] = useState(0);
  interface DataType {
    index: number;
    name: string;
  }
  const [propoData, setpropoData] = useState<DataType[]>([]);

  // inputnumber onchange---------------------------------------------------
  const onChange = (value: number) => {
    console.log('changed', value);
  };

  // -----------------------------------------------------------nft
  const GetERC721 = async () => {
    if (account === '') {
      alert('You have not connected wallet yet.');
      return;
    }

    if (stuERC721Contract) {
      try {
        await stuERC721Contract.methods
          .awardItem(account, 'https://ipfs.io/ipfs/QmZS4LgipyEdForqdWgVBBQGZUyjzpTsNWBehXA4dSLJAn')
          .send({
            from: account,
          });
        alert('You have claimed nft.');
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Contract not exists.');
    }
  };

  // const getAward = async () => {
  //   if (account === '') {
  //     alert('You have not connected wallet yet.');
  //     return;
  //   }
  //   if (proposeContract) {
  //     try {
  //       const a = await proposeContract.methods.getIsAwarded(0).call();
  //       console.log('aaaaaaaaaaaaaaaa', a);
  //       await proposeContract.methods.setIsAwarded(1).send()
  //       const b = await proposeContract.methods.getIsAwarded(0).call();
  //       console.log('aaaaaaaaaaaaaaaa', b);
  //       alert('You have claimed award.');
  //       alert('You have awarded.');
  //     } catch (error: any) {
  //       alert(error.message);
  //     }
  //   } else {
  //     alert('Contract not exists.');
  //   }
  // };

  //   -----------------------表格列-------------------------------------------
  const columns: ColumnsType<DataType> = [
    {
      title: 'Index',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: 'Action',
      key: 'action',
      render: (record) => (
        <Space size="middle">
          <button onClick={() => onVote(record)}>支持</button>
          <button onClick={() => onAgainst(record)}>反对</button>
        </Space>
      ),
    },
  ];
  //   -----------------------提案数据get------------------------------------------
  useEffect(() => {
    const getData = async () => {
      // 获取propose数据
      const pNum = await proposeContract.methods.getPropoNum().call();
      // 如果pnum大于propoNum，说明有新的数据

      // 获取新的数据
      setPropoNum(pNum);
      let pArr: DataType[] = [];
      for (let i = 0; i < pNum; i++) {
        // 判断该提案是否已经结束
        let isEnd = await proposeContract.methods.getIsFinish(i).call();

        if (isEnd === '0') {
          const pName = await proposeContract.methods.getPropName(i).call();
          pArr.push({ index: i, name: pName });
        }
      }
      setpropoData(pArr);
    };
    getData();
  }, [propoData, propoNum]);
  //   -----------------------表单------------------------------------------

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  //   onchenge 函数 输入为value, 返回值为 void

  const onPropose = async (values: any) => {
    if (account === '') {
      alert('You have not connected wallet yet.');
      return;
    }

    if (proposeContract && stuERC20Contract) {
      try {
        console.log('account', account);
        await stuERC20Contract.methods.approve(proposeContract.options.address, 1000).send({
          from: account,
        });
        // 将提案提交到合约
        let h: number;
        // 把time乘3600转化成秒
        h = values.time * 3600;
        console.log('timeeeeeeeeeeeeeeeeeee', h);
        await proposeContract.methods.propose(values.name, h).send({
          from: account,
        });

        const sa = await proposeContract.methods.getPropoNum().call();
        setPropoNum(sa);
        alert('成功发起提案');
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Contract not exists.');
    }
  };

  //   -----------------------checkaccount------------------------------------------
  useEffect(() => {
    // 初始化检查用户是否已经连接钱包
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    const initCheckAccounts = async () => {
      console.log('ijiiiiiiii');
      // @ts-ignore
      const { ethereum } = window;
      if (Boolean(ethereum && ethereum.isMetaMask)) {
        // 尝试获取连接的用户账户
        const accounts = await web3.eth.getAccounts();
        if (accounts && accounts.length) {
          console.log('accounts', accounts);

          setAccount(accounts[0]);
        }
      }
    };

    initCheckAccounts();
  }, []);

  //  -----------------------合约信息------------------------------------------
  useEffect(() => {
    const getproposeContractInfo = async () => {
      if (proposeContract) {
        const pa = await proposeContract.methods.PLAY_AMOUNT().call();
        // 定义一个number类型变量
        let paNum: number = 55;
        setPlayAmount(paNum);
        console.log('pa', pa);
        console.log('playAmount', playAmount);
        console.log('account', account);
        // console.log('paaaaaaaaaaaaaaaaaaaaaaaaaaa',pa)
        const ssa = await proposeContract.methods.getPropoNum().call();
        console.log('ssa', ssa);
        // // 输出sa的类型
        setPropoNum(ssa);
        console.log('propoNum', propoNum);
        console.log('hhhhhhhhhhhhhhh');
      } else {
        alert('Contract not exists.');
      }
    };

    getproposeContractInfo();
  }, []);

  useEffect(() => {
    const getAccountInfo = async () => {
      if (stuERC20Contract) {
        const ab = await stuERC20Contract.methods.balanceOf(account).call();
        setAccountBalance(ab);
      } else {
        alert('Contract not exists.');
      }
    };

    if (account !== '') {
      getAccountInfo();
    }
  }, [account]);
  useEffect(() => {
    const getIsJoinClub = async () => {
      if (stuERC20Contract) {
        console.log('ccccccccccccccccccccc');

        const isJoin = await stuERC20Contract.methods.IsJoin().call();
        setJoinClub(isJoin);
        console.log('isJoin', isJoin);
      } else {
        alert('Contract not exists.');
      }
    };

    getIsJoinClub();
  }, [account]);
  const onClaimTokenAirdrop = async () => {
    if (account === '') {
      alert('You have not connected wallet yet.');
      return;
    }
    if (stuERC20Contract) {
      try {
        await stuERC20Contract.methods.airdrop().send({
          from: account,
        });
        setJoinClub(1);
        alert('You have joined the club and obtained club token.');
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Contract not exists.');
    }
  };

  const onVote = async (record: DataType) => {
    if (account === '') {
      alert('You have not connected wallet yet.');
      return;
    }

    if (proposeContract && stuERC20Contract) {
      try {
        const allw = await stuERC20Contract.methods
          .allowance(account, proposeContract.options.address)
          .call();
        console.log('allw', allw);
        if (allw === '0') {
          await stuERC20Contract.methods.approve(proposeContract.options.address, 1000).send({
            from: account,
          });
        }

        console.log('account', account);
        await proposeContract.methods.Vote(record.index, 1).send({
          from: account,
        });

        alert('投票成功');
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Contract not exists.');
    }
  };
  // `   record：参数类型为DataType，text：参数类型为string，index：参数类型为number`
  const onAgainst = async (record: DataType) => {
    if (account === '') {
      alert('You have not connected wallet yet.');
      return;
    }
    if (proposeContract && stuERC20Contract) {
      try {
        await proposeContract.methods.vote(record.index, -1).send({
          from: account,
        });

        alert('You have refunded tokens.');
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Contract not exists.');
    }
  };

  const onClickConnectWallet = async () => {
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    // @ts-ignore
    const { ethereum } = window;
    if (!Boolean(ethereum && ethereum.isMetaMask)) {
      alert('MetaMask is not installed!');
      return;
    }

    try {
      // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
      if (ethereum.chainId !== GanacheTestChainId) {
        const chain = {
          chainId: GanacheTestChainId, // Chain-ID
          chainName: GanacheTestChainName, // Chain-Name
          rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
        };

        try {
          // 尝试切换到本地网络
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chain.chainId }],
          });
        } catch (switchError: any) {
          // 如果本地网络没有添加到Metamask中，添加该网络
          if (switchError.code === 4902) {
            await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain] });
          }
        }
      }

      // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
      await ethereum.request({ method: 'eth_requestAccounts' });
      // 获取小狐狸拿到的授权用户列表
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      // 如果用户存在，展示其account，否则显示错误信息
      setAccount(accounts[0] || 'Not able to get accounts');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <PageContainer>
      <div>
        {<button onClick={onClaimTokenAirdrop}>领取社团币</button>}

        <div className="form">
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 5 }}
            onFinish={onPropose}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="提案名称"
              name="name"
              rules={[{ required: true, message: 'Please input your proposal name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="持续时间(h)"
              name="time"
              rules={[
                {
                  required: true,
                  message: 'Please enter the duration of the proposal (in hours)',
                },
              ]}
            >
              <InputNumber style={{ width: 213 }} onChange={onChange} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className="operation">
          <div className="table">
            <Table
              title={() => '提案列表'}
              dataSource={propoData}
              columns={columns}
              rowKey={(record) => {
                return record.index;
              }}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProposePage;
