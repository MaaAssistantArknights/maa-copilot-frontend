/*
 * @Author: Gemini2035 2530056984@qq.com
 * @Date: 2024-01-02 19:11:20
 * @LastEditors: Gemini2035 2530056984@qq.com
 * @LastEditTime: 2024-01-06 19:25:53
 * @FilePath: /maa-copilot-frontend/src/components/editor/operator/EditorSheet.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Button, Drawer } from '@blueprintjs/core'

import { useState } from 'react'

import { SheetGroupContainer, SheetGroupProps } from './sheet/SheetGroup'
import {
  SheetOperatorContainer,
  SheetOperatorProps,
} from './sheet/SheetOperator'

type EditorSheetProps = SheetOperatorProps & SheetGroupProps

const EditorOperatorSheet = (sheetProps: EditorSheetProps) => {
  return (
    <div className="overflow-y-auto">
      <SheetOperatorContainer {...sheetProps} />
      <SheetGroupContainer {...sheetProps} />
    </div>
  )
}

export const EditorSheetTrigger = (sheetProps: EditorSheetProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Drawer isOpen={open} onClose={() => setOpen(false)}>
        <EditorOperatorSheet {...sheetProps} />
      </Drawer>
      <Button onClick={() => setOpen(true)} text="快捷编辑" />
    </>
  )
}
