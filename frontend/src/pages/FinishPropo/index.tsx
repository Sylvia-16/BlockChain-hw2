
import { Table} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {useEffect, useState} from 'react';
import {proposeContract} from "../../utils/contracts";
import './index.css';

const FinishPage = () => {
    interface DataType {
        index: number;
        name: string;
        result:string;
      }
    const [finishData, setfinishData] = useState<DataType[]>([]);
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
            dataIndex: 'vote',
            key: 'vote',
            // 如果
        },
        
      ];
      useEffect(() => {
        const getData= async () => {
            // 获取propose数据
            const pNum = await proposeContract.methods.getPropoNum().call()
            // 如果pnum大于propoNum，说明有新的数据
           
                // 获取新的数据
            
                let pArr:DataType[] = []
                for(let i = 0; i < pNum; i++){
                    // 判断该提案是否已经结束
                    let isEnd = await proposeContract.methods.getIsFinish(i).call()
               
                    console.log('i',i,'isEnd',isEnd)
                  
                    if(isEnd==='1'){
                    const pName = await proposeContract.methods.getPropName(i).call()
                    const pResult = await proposeContract.methods.countVote(i).call()
                    if (pResult === '0') {
                        pArr.push({
                            index: i,
                            name: pName,
                            result: '未通过'
                        })
                    }else{
                        pArr.push({
                            index: i,
                            name: pName,
                            result: '通过'
                        })
                    }
                }
                }
                setfinishData(pArr)
            
        }
        getData()
        }, [])
    return (
        <div className='table'>
        <Table dataSource={finishData} columns={columns} rowKey={(record) => {   return record.index}}/>
    </div>
    )
}
export default FinishPage;