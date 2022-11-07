import { PageContainer } from '@ant-design/pro-components';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { proposeContract, web3 } from '../../utils/contracts';
import './index.less';

const FinishPage = () => {
  interface DataType {
    index: number;
    name: string;
    result: string;
  }
  const [account, setAccount] = useState('');
  const [finishData, setfinishData] = useState<DataType[]>([]);
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
  }, []);
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
      title: '投票结果',
      dataIndex: 'result',
      key: 'result',
      // 如果
    },
  ];

  useEffect(() => {
    const getData = async () => {
      // 获取propose数据
      const pNum = await proposeContract.methods.getPropoNum().call();
      // 如果pnum大于propoNum，说明有新的数据

      // 获取新的数据

      let pArr: DataType[] = [];

      let ss: string = '通过';
      let fs: string = '未通过';
      let d: DataType;
      for (let i = 0; i < pNum; i++) {
        // 判断该提案是否已经结束
        let isEnd = await proposeContract.methods.getIsFinish(i).call();

        console.log('i', i, 'isEnd', isEnd);
        const pResult = await proposeContract.methods.getVoteResult(i).call();
        console.log('pResult,i', pResult, i);
        if (isEnd === '1') {
          console.log('i111111111111111111111111111111111');
          const pName = await proposeContract.methods.getPropName(i).call();
          const pResult = await proposeContract.methods.getVoteResult(i).call();
          if (pResult === '0') {
            d = {
              index: i,
              name: pName,
              result: fs,
            };
          } else {
            d = {
              index: i,
              name: pName,
              result: ss,
            };
            const IsAwarded = await proposeContract.methods.getIsAwarded(i).call();
            console.log(' i IsAwarded', i, IsAwarded);
            if (IsAwarded === '0') {
              // 发放token奖励

              await proposeContract.methods.AwardToken(i).send({ from: account });
              await proposeContract.methods.setIsAwarded(i).send({ from: account });
            }
          }

          pArr.push(d);
        }
      }
      setfinishData(pArr);
    };
    getData();
  }, [account]);

  return (
    <PageContainer>
      <div className="table">
        <Table
          dataSource={finishData}
          columns={columns}
          rowKey={(record) => {
            return record.index;
          }}
        />
      </div>
    </PageContainer>
  );
};
export default FinishPage;
