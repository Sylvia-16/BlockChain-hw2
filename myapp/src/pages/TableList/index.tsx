import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Descriptions } from 'antd';
import './index.less';
import { proposeContract, stuERC20Contract, stuERC721Contract, web3 } from '../../utils/contracts';

const UserInfo = () => {
  const [account, setAccount] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [succnum, setSuccnum] = useState(0);
  const [nft, setnft] = useState(0);
  useEffect(() => {
    // 初始化检查用户是否已经连接钱包
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    const initCheckAccounts = async () => {
      // @ts-ignore
      const { ethereum } = window;
      if (Boolean(ethereum && ethereum.isMetaMask)) {
        // 尝试获取连接的用户账户
        const accounts = await web3.eth.getAccounts();
        if (accounts && accounts.length) {
          setAccount(accounts[0]);
        }
      }
    };

    initCheckAccounts();
  }, [account]);
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
    const getNftNum = async () => {
      if (stuERC721Contract) {
        const sn = await stuERC721Contract.methods.balanceOf(account).call();
        setnft(sn);
      } else {
        alert('Contract not exists.');
      }
    };
    if (account !== '') {
      getNftNum();
    }
  }, [account]);

  useEffect(() => {
    const getsuccnum = async () => {
      if (proposeContract) {
        const ab = await proposeContract.methods.getSuccNum(account).call();
        console.log('ab', ab);
        setSuccnum(ab);
        if (ab >= '3') {
          // 发nft
          // 先查看该用户是否有nft
          const nftnum = await stuERC721Contract.methods.balanceOf(account).call();
          if (nftnum === '0') {
            await stuERC721Contract.methods
              .awardItem(
                account,
                'https://ipfs.io/ipfs/QmZS4LgipyEdForqdWgVBBQGZUyjzpTsNWBehXA4dSLJAn',
              )
              .send({
                from: account,
              });
          }
        }
      } else {
        alert('Contract not exists.');
      }
    };
    if (account !== '') {
      getsuccnum();
    }
  }, [account]);

  return (
    <PageContainer>
      <div className="u">
        <Descriptions title="User Info" layout="vertical">
          <Descriptions.Item label="地址">
            {account === '' ? '请先连接钱包' : account}
          </Descriptions.Item>
          <Descriptions.Item label="token">
            {account === '' ? '请连接钱包' : accountBalance}
          </Descriptions.Item>
          <Descriptions.Item label="成功的提案数目">
            {account === '' ? '请连接钱包' : succnum}
          </Descriptions.Item>
          <Descriptions.Item label="纪念品数目" span={2}>
            {account === '' ? '请连接钱包' : nft}
          </Descriptions.Item>
        </Descriptions>
      </div>
      {/* 写地址 钱有多少 通过的提案个数 有多少奖励 */}
      <div className="button">{account === '' && <button>连接钱包</button>}</div>
    </PageContainer>
  );
};
export default UserInfo;
