import { JSX, useState } from "react"
import { Modal } from "../modal/Modal"
import { FieldTypeSelector } from "./FieldTypeSelector"
import { TextFieldConfigurator } from "./TextFieldConfigurator"
import { RadioFieldConfigurator } from "./RadioFieldConfigurator"
import { SimpleFieldConfigurator } from "./SimpleFieldConfigurator"
import { CurrencyFieldConfigurator } from "./CurrencyFieldConfigurator"
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
    "text" | "radio" | "phone" | "email" | "currency" | null
  >(null)

  const handleClose = () => {
    setSelectedType(null)
    onClose()
  }

  const handleFieldAdd = (config: DynamicFieldConfig) => {
    onFieldAdd(config)
    handleClose()
  }

  const titles: Record<string, string> = {
    text: "Configure Text Field",
    radio: "Configure Radio Button Field",
    phone: "Configure Phone Field",
    email: "Configure Email Field",
    currency: "Configure Funding Amount Field",
  }

  const title = selectedType ? titles[selectedType] : "Add Custom Field"
  const goBack = () => setSelectedType(null)

  const configuratorContent = () => {
    switch (selectedType) {
      case "text":
        return (
          <TextFieldConfigurator onSubmit={handleFieldAdd} onCancel={goBack} />
        )
      case "radio":
        return (
          <RadioFieldConfigurator onSubmit={handleFieldAdd} onCancel={goBack} />
        )
      case "currency":
        return (
          <CurrencyFieldConfigurator
            onSubmit={handleFieldAdd}
            onCancel={goBack}
          />
        )
      case "phone":
      case "email":
        return (
          <SimpleFieldConfigurator
            fieldType={selectedType}
            onSubmit={handleFieldAdd}
            onCancel={goBack}
          />
        )
      default:
        return (
          <FieldTypeSelector
            onSelect={setSelectedType}
            onCancel={handleClose}
          />
        )
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {configuratorContent()}
    </Modal>
  )
}
