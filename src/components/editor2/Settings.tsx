import {
  Button,
  Dialog,
  DialogBody,
  FormGroup,
  Switch,
} from '@blueprintjs/core'

import { useAtom } from 'jotai'
import { useState } from 'react'

import { NumericInput2 } from '../editor/NumericInput2'
import { editorAtoms } from './editor-state'

export const Settings = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useAtom(editorAtoms.config)

  return (
    <>
      <Button icon="cog" minimal onClick={() => setIsOpen(true)} title="设置" />

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Editor Settings"
      >
        <DialogBody>
          <FormGroup label="Display Options">
            <Switch
              checked={config.showLinkerButtons}
              label="Always Show Linker Buttons"
              onChange={(e) =>
                setConfig({ showLinkerButtons: e.currentTarget.checked })
              }
            />
            <Switch
              checked={config.toggleSelectorPanel}
              label="Automatically Toggle Selector Panel"
              onChange={(e) =>
                setConfig({ toggleSelectorPanel: e.currentTarget.checked })
              }
            />
            <Switch
              checked={config.showErrorsByDefault}
              label="Show Errors By Default"
              onChange={(e) =>
                setConfig({ showErrorsByDefault: e.currentTarget.checked })
              }
            />
          </FormGroup>

          <FormGroup
            label="Undo History Limit"
            helperText="A larger limit will use more memory."
          >
            <NumericInput2
              intOnly
              clampValueOnBlur
              value={config.historyLimit}
              onValueChange={(value) =>
                setConfig({ historyLimit: Math.max(value, 5) })
              }
              min={5}
              stepSize={5}
            />
          </FormGroup>
        </DialogBody>
      </Dialog>
    </>
  )
}
