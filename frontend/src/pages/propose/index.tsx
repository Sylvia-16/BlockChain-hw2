import {Button} from 'antd';
import { Space, Table} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {useEffect, useState} from 'react';
import {proposeContract, stuERC20Contract, web3} from "../../utils/contracts";
import './index.css';
import BButton from '@material-ui/core/Button';
import internal from 'stream';
const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'
// eslint-disable-next-line
const ProposePage = () => {

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [propoNum, setPropoNum] = useState(0)
    
    const[playAmount, setPlayAmount] = useState(0)

    interface DataType {
        index: number;
        name: string;
      }
    let propoData: DataType[];
      const columns: ColumnsType<DataType> = [
        {
          title: 'Index',
          dataIndex: 'index',
          key: 'index',
          render: text => <a>{text}</a>,
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
        },
       
        {
          title: 'Action',
          key: 'action',
          render: (_, record) => (
            <Space size="middle">
              <a>Invite {record.name}</a>
              <a>Delete</a>
            </Space>
          ),
        },
        
      ];
      
   


    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getproposeContractInfo = async () => {
            if (proposeContract) {
                const pa = await proposeContract.methods.PLAY_AMOUNT().call()
                setPlayAmount(pa)

                console.log('paaaaaaaaaaaaaaaaaaaaaaaaaaa',pa)
                // await proposeContract.methods.getPropoNum().call()
                // console.log(pa)
                // const sa=await proposeContract.methods.getPropoNum().call()
                // 输出sa的类型
                
                // if(sa!==0){
                //     alert('000000000000000000ddd00000000000000000000000')
                //     setPropoNum(sa)
                //     let d:DataType 
                //     console.log(sa)
                //   //遍历proposal 将name和index存入propoData
                //     for(let i=0;i<sa;i++){
                //         const name=await proposeContract.methods.getPropoName(i).call();
                //         //把name和index存入d
                //         d={
                //             index:i,
                //             name:name
                //         }
                //         alert('n')
                //         //把d存入propoData
                //         propoData.push(d);
                //     }
                // }
                // console.log(sa);
            } else {
                alert('Contract not exists.')
            }
        }

        getproposeContractInfo()
    }, [])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (stuERC20Contract) {
                const ab = await stuERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (stuERC20Contract) {
            try {
                await stuERC20Contract.methods.airdrop().send({
                    from: account
                })
                alert('You have claimed ZJU Token.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onPropose = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (proposeContract && stuERC20Contract) {
            try {
                await stuERC20Contract.methods.approve(proposeContract.options.address, playAmount).send({
                    from: account
                })

                await proposeContract.methods.propose("fdsfa",10).send({
                    from: account
                })
                const sa=await proposeContract.methods.getPropoNum().call();
                if(sa!==0){
                    alert('00000000000000000000000000000000000000000')
                    setPropoNum(sa)
                    console.log('ssssssssssssssssssssssss',propoNum)
                    let d:DataType 
                  //遍历proposal 将name和index存入propoData
                    for(let i=0;i<sa;i++){
                        const name=await proposeContract.methods.getPropoName(i).call();
                        //把name和index存入d
                        d={
                            index:i,
                            name:name
                        }
                        //把d存入propoData
                        propoData.push(d);
                    }
                }
                alert('你已经发起过提案')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onVote = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        } 

        if (proposeContract && stuERC20Contract) {
            try {
                await proposeContract.methods.vote(1,1).send({
                    from: account
                })

                alert('You have投过票了')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onAgainst = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        } 

        if (proposeContract && stuERC20Contract) {
            try {
                await proposeContract.methods.vote(1,-1).send({
                    from: account
                })

                alert('You have refunded tokens.')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
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
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }



     const Ptables: React.FC = () => <Table columns={columns} dataSource={propoData} />;
    return (
        <div className='container'>
           
            <div className='main'>
                <h1>浙大彩票DEMO</h1>
                <BButton variant="contained" onClick={onClaimTokenAirdrop}>加入社团</BButton>
               
                
                <div className='account'>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>当前用户拥有浙大币数量：{account === '' ? 0 : accountBalance}</div>
                </div>
               <div className='try'>
              提案数量
               </div>
               
              
                <div className='operation'>
                    <div style={{marginBottom: '20px'}}>操作栏</div>
                    <div className='buttons'>
                        <Button style={{width: '200px'}} onClick={onPropose}>提出提案</Button>
                        <Button style={{width: '200px'}} onClick={onVote}>支持提案</Button>
                        <Button style={{width: '200px'}} onClick={onAgainst}>反对提案</Button>
                        <Ptables></Ptables>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProposePage