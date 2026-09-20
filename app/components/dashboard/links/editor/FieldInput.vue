<script setup lang="ts">
import type { AnyFieldApi } from '@/types'

defineProps<{
  field: AnyFieldApi
  inputId: string
  label: string
  description?: string
  type?: string
  inputmode?: string
  placeholder?: string
  autocomplete?: string
  disabled?: boolean
  invalid?: boolean
  ariaInvalid?: string
  errors?: string[]
  min?: number | string
  max?: number | string
  step?: number | string
}>()
</script>

<template>
  <Field :data-invalid="invalid || undefined">
    <FieldLabel :for="inputId">
      {{ label }}
    </FieldLabel>
    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <Input
      :id="inputId"
      :name="field.name"
      :model-value="field.state.value"
      :type="type"
      :inputmode="inputmode"
      :disabled="disabled"
      :aria-invalid="ariaInvalid"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :min="min"
      :max="max"
      :step="step"
      @blur="field.handleBlur"
      @input="field.handleChange(type === 'number' ? (($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value)) : ($event.target as HTMLInputElement).value)"
    />
    <FieldError
      v-if="invalid"
      :errors="errors"
    />
  </Field>
</template>
