<script setup lang="ts">
import type { CornerDotType, CornerSquareType, DotType } from 'qr-code-styling'
import { Download, ImagePlus } from 'lucide-vue-next'
import QRCodeStyling from 'qr-code-styling'

const props = withDefaults(defineProps<{
  data: string
  image?: string
}>(), {
  image: '',
})

const { t } = useI18n()

const color = ref('#000000')
const dotStyle = ref<DotType>('dots')
const cornerSquareStyle = ref<CornerSquareType>('extra-rounded')
const cornerDotStyle = ref<CornerDotType>('dot')
const transparentBg = ref(false)
const downloadFormat = ref<'png' | 'svg'>('png')
const logoMode = ref<'website' | 'custom' | 'none'>(props.image ? 'website' : 'none')
const customLogoUrl = ref('')

const DOT_STYLES: { value: DotType, label: string }[] = [
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
]

const CORNER_SQUARE_STYLES: { value: CornerSquareType, label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'dot', label: 'Dot' },
]

const CORNER_DOT_STYLES: { value: CornerDotType, label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
]

const currentImage = computed(() => {
  if (logoMode.value === 'website')
    return props.image
  if (logoMode.value === 'custom')
    return customLogoUrl.value
  return ''
})

const options = {
  width: 256,
  height: 256,
  data: props.data,
  margin: 10,
  qrOptions: { typeNumber: 0 as const, mode: 'Byte' as const, errorCorrectionLevel: 'Q' as const },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 2 },
  dotsOptions: { type: 'dots' as const, color: '#000000', gradient: null },
  backgroundOptions: { color: '#ffffff', gradient: null },
  image: currentImage.value,
  cornersSquareOptions: { type: 'extra-rounded' as const, color: '#000000' },
  cornersDotOptions: { type: 'dot' as const, color: '#000000' },
}

const qrCode = new QRCodeStyling(options)
const qrCodeEl = ref<HTMLElement | null>(null)

function updateQrCode() {
  qrCode.update({
    dotsOptions: { type: dotStyle.value, color: color.value, gradient: null },
    cornersSquareOptions: { type: cornerSquareStyle.value, color: color.value },
    cornersDotOptions: { type: cornerDotStyle.value, color: color.value },
    backgroundOptions: { color: transparentBg.value ? 'transparent' : '#ffffff', gradient: null },
    image: currentImage.value,
  })
}

watch([color, dotStyle, cornerSquareStyle, cornerDotStyle, transparentBg, logoMode, customLogoUrl], () => {
  updateQrCode()
})

function onCustomLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      customLogoUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function downloadQRCode() {
  const slug = props.data.split('/').pop()
  qrCode.download({
    extension: downloadFormat.value,
    name: `qr_${slug}`,
  })
}

onMounted(() => {
  if (qrCodeEl.value) {
    qrCode.append(qrCodeEl.value as unknown as HTMLElement)
  }
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      ref="qrCodeEl"
      :data-text="data"
      class="rounded-lg p-1"
      :class="transparentBg ? 'bg-transparent' : 'bg-white'"
    />

    <div class="flex w-full flex-col gap-3">
      <div class="flex items-center gap-3">
        <Label class="w-16 shrink-0 text-xs">{{ t('links.qr.color') }}</Label>
        <div class="relative flex items-center">
          <div
            class="
              h-7 w-7 cursor-pointer overflow-hidden rounded-full border
              border-gray-300
              dark:border-gray-600
            "
            :style="{ backgroundColor: color }"
            :title="t('links.change_qr_color')"
          >
            <input
              v-model="color"
              type="color"
              class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              :title="t('links.change_qr_color')"
            >
          </div>
        </div>

        <Label class="ml-auto shrink-0 text-xs">{{ t('links.qr.transparent_bg') }}</Label>
        <Checkbox
          :checked="transparentBg"
          @update:checked="(val: boolean) => transparentBg = val"
        />
      </div>

      <div class="flex items-center gap-3">
        <Label class="w-16 shrink-0 text-xs">{{ t('links.qr.dot_style') }}</Label>
        <Select v-model="dotStyle">
          <SelectTrigger class="h-8 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="style in DOT_STYLES" :key="style.value" :value="style.value">
              {{ style.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-3">
        <Label class="w-16 shrink-0 text-xs">{{ t('links.qr.corner_style') }}</Label>
        <Select v-model="cornerSquareStyle">
          <SelectTrigger class="h-8 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="style in CORNER_SQUARE_STYLES" :key="style.value" :value="style.value">
              {{ style.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-3">
        <Label class="w-16 shrink-0 text-xs">{{ t('links.qr.corner_dot') }}</Label>
        <Select v-model="cornerDotStyle">
          <SelectTrigger class="h-8 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="style in CORNER_DOT_STYLES" :key="style.value" :value="style.value">
              {{ style.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-3">
        <Label class="w-16 shrink-0 text-xs">{{ t('links.qr.logo') }}</Label>
        <Select v-model="logoMode">
          <SelectTrigger class="h-8 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              {{ t('links.qr.logo_none') }}
            </SelectItem>
            <SelectItem v-if="image" value="website">
              {{ t('links.qr.logo_website') }}
            </SelectItem>
            <SelectItem value="custom">
              {{ t('links.qr.logo_custom') }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="logoMode === 'custom'" class="flex items-center gap-3">
        <Label class="w-16 shrink-0 text-xs" />
        <label
          class="
            flex h-8 flex-1 cursor-pointer items-center gap-2 rounded-md border
            border-input px-3 text-xs
            hover:bg-accent
          "
        >
          <ImagePlus class="h-3.5 w-3.5 shrink-0" />
          <span class="truncate">{{ customLogoUrl ? t('links.qr.logo_change') : t('links.qr.logo_upload') }}</span>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="onCustomLogoUpload"
          >
        </label>
      </div>

      <div class="flex items-center gap-3">
        <Select v-model="downloadFormat">
          <SelectTrigger class="h-8 w-20 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">
              PNG
            </SelectItem>
            <SelectItem value="svg">
              SVG
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          class="flex-1"
          @click="downloadQRCode"
        >
          <Download class="mr-2 h-4 w-4" />
          {{ t('links.download_qr_code') }}
        </Button>
      </div>
    </div>
  </div>
</template>
