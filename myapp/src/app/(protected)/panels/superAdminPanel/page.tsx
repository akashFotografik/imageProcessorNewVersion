import React from 'react'
import { PanelTable } from '@/components/panel-table';
import { Card } from '@/components/ui/card';
import { PanelSectionCards } from '@/components/panel-section-cards';
import MultiCompanyGraph from '@/components/panels-components/multi-company-graph';
import CreditUsedGraph from '@/components/panels-components/credit-used-graph';

const page = () => {
  return (
    <div className='p-4'>
      <div className='flex gap-4 justify-between w-full'>
        <div className='w-full'>
          <div>
            <PanelSectionCards />
          </div>
          <div className='mt-4'>
            <MultiCompanyGraph />
          </div>
        </div>
        <div className='w-full'>
          <Card className='p-4'>
            <PanelTable />
          </Card>
          <Card className='mt-4 p-4'>
            <div className='flex gap-4 w-full justify-between'>
              <div className='w-full'>
              <CreditUsedGraph />
            </div>
            <div className='w-full'>
              Hello
            </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default page