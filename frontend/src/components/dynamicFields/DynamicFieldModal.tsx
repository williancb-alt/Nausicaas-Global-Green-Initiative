import { JSX, useState } from "react"
import { Modal } from "../modal/Modal"
import { FieldTypeSelector } from "./FieldTypeSelector"
import { TextFieldConfigurator } from "./TextFieldConfigurator"
import { RadioFieldConfigurator } from "./RadioFieldConfigurator"
import { SimpleFieldConfigurator } from "./SimpleFieldConfigurator"
import type { DynamicFieldConfig } from "../../types"

interface DynamicFieldModalProps {
  isOpen: boolean
  onClose: () => void
  onFieldAdd: (config: DynamicFieldConfig) => void
}

export function DynamicFieldModal({
  isOpen,
  onClose,
  onFieldAdd,
}: DynamicFieldModalProps): JSX.Element {
  const [selectedType, setSelectedType] = useState<
    "text" | "radio" | "phone" | "email" | null
  >(null)

  const handleClose = () => {
    setSelectedType(null)
    onClose()
  }

  const handleFieldAdd = (config: DynamicFieldConfig) => {
    onFieldAdd(config)
    handleClose()
  }

  const getTitle = () => {
    if (!selectedType) return "Add Custom Field"
    if (selectedType === "text") return "Configure Text Field"
    if (selectedType === "radio") return "Configure Radio Button Field"
    if (selectedType === "phone") return "Configure Phone Field"
    return "Configure Email Field"
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      {!selectedType && (
        <FieldTypeSelector onSelect={setSelectedType} onCancel={handleClose} />
      )}

      {selectedType === "text" && (
        <TextFieldConfigurator
          onSubmit={handleFieldAdd}
          onCancel={() => setSelectedType(null)}
        />
      )}

      {selectedType === "radio" && (
        <RadioFieldConfigurator
          onSubmit={handleFieldAdd}
          onCancel={() => setSelectedType(null)}
        />
      )}

      {(selectedType === "phone" || selectedType === "email") && (
        <SimpleFieldConfigurator
          fieldType={selectedType}
          onSubmit={handleFieldAdd}
          onCancel={() => setSelectedType(null)}
        />
      )}
    </Modal>
  )
}
