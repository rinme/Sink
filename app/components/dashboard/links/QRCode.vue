<script setup lang="ts">
import type { CornerDotType, CornerSquareType, DotType } from 'qr-code-styling'
import { Download, ImagePlus } from '@lucide/vue'
import QRCodeStyling from 'qr-code-styling'
import { toast } from 'vue-sonner'

const props = withDefaults(defineProps<{
  data: string
  image?: string
}>(), {
  image: '',
})

const MAX_LOGO_SIZE = 2 * 1024 * 1024 // 2MB

const { t } = useI18n()

const color = ref('#000000')
const dotStyle = ref<DotType>('dots')
const cornerSquareStyle = ref<CornerSquareType>('extra-rounded')
const cornerDotStyle = ref<CornerDotType>('dot')
const transparentBg = ref(false)
const downloadFormat = ref<'png' | 'svg'>('png')
const logoMode = ref<'website' | 'custom' | 'none'>(props.image ? 'website' : 'none')
const customLogoUrl = ref('')

const DOT_STYLES: { value: DotType, labelKey: string }[] = [
  { value: 'rounded', labelKey: 'links.qr.dot_styles.rounded' },
  { value: 'dots', labelKey: 'links.qr.dot_styles.dots' },
  { value: 'classy', labelKey: 'links.qr.dot_styles.classy' },
  { value: 'classy-rounded', labelKey: 'links.qr.dot_styles.classy_rounded' },
  { value: 'square', labelKey: 'links.qr.dot_styles.square' },
  { value: 'extra-rounded', labelKey: 'links.qr.dot_styles.extra_rounded' },
]

const CORNER_SQUARE_STYLES: { value: CornerSquareType, labelKey: string }[] = [
  { value: 'dot', labelKey: 'links.qr.corner_square_styles.dot' },
  { value: 'square', labelKey: 'links.qr.corner_square_styles.square' },
  { value: 'extra-rounded', labelKey: 'links.qr.corner_square_styles.extra_rounded' },
]

const CORNER_DOT_STYLES: { value: CornerDotType, labelKey: string }[] = [
  { value: 'dot', labelKey: 'links.qr.corner_dot_styles.dot' },
  { value: 'square', labelKey: 'links.qr.corner_dot_styles.square' },
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
  type: 'svg' as const,
  margin: 10,
  qrOptions: { typeNumber: 0 as const, mode: 'Byte' as const, errorCorrectionLevel: 'Q' as const },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 2 },
  dotsOptions: { type: dotStyle.value, color: color.value },
  backgroundOptions: { color: transparentBg.value ? 'transparent' : '#ffffff' },
  image: currentImage.value,
  cornersSquareOptions: { type: cornerSquareStyle.value, color: color.value },
  cornersDotOptions: { type: cornerDotStyle.value, color: color.value },
}

const qrCode = new QRCodeStyling(options)
const qrCodeEl = useTemplateRef<HTMLElement>('qrCodeEl')

function updateQrCode() {
  qrCode.update({
    data: props.data,
    dotsOptions: { type: dotStyle.value, color: color.value },
    cornersSquareOptions: { type: cornerSquareStyle.value, color: color.value },
    cornersDotOptions: { type: cornerDotStyle.value, color: color.value },
    backgroundOptions: { color: transparentBg.value ? 'transparent' : '#ffffff' },
    image: currentImage.value,
  })
}

watch(
  [color, dotStyle, cornerSquareStyle, cornerDotStyle, transparentBg, currentImage, () => props.data],
  () => {
    updateQrCode()
  },
)

watch(() => props.image, (newImage) => {
  if (newImage && logoMode.value === 'none') {
    logoMode.value = 'website'
  }
  else if (!newImage && logoMode.value === 'website') {
    logoMode.value = 'none'
  }
})

function revokeCustomLogo() {
  if (customLogoUrl.value) {
    URL.revokeObjectURL(customLogoUrl.value)
    customLogoUrl.value = ''
  }
}

function onCustomLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return
  if (!file.type.startsWith('image/')) {
    toast.error(t('links.form.image_invalid_type'))
    target.value = ''
    return
  }
  if (file.size > MAX_LOGO_SIZE) {
    toast.error(t('links.qr.logo_too_large'))
    target.value = ''
    return
  }
  const objectUrl = URL.createObjectURL(file)
  revokeCustomLogo()
  customLogoUrl.value = objectUrl
  target.value = ''
}

onBeforeUnmount(() => {
  revokeCustomLogo()
})

function downloadQRCode() {
  const cleanData = props.data.replace(/\/+$/, '')
  const slug = cleanData.split('/').pop() || 'code'
  qrCode.download({
    extension: downloadFormat.value,
    name: `qr_${slug}`,
  })
}

onMounted(() => {
  if (qrCodeEl.value) {
    qrCode.append(qrCodeEl.value)
  }
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      ref="qrCodeEl"
      :data-text="data"
      role="img"
      :aria-label="t('links.qr.text_alternative', { url: data })"
      class="rounded-lg border border-border p-1 shadow-sm"
      :class="transparentBg ? 'bg-transparent' : 'bg-white'"
    />

    <div class="flex w-full flex-col gap-3">
      <div class="flex items-center gap-3">
        <Label class="w-20 shrink-0 text-xs">{{ t('links.qr.color') }}</Label>
        <div class="relative flex items-center">
          <label
            class="
              relative size-7 cursor-pointer overflow-hidden rounded-full border
              border-input ring-offset-background
              focus-within:ring-3 focus-within:ring-ring/50
            "
            :style="{ backgroundColor: color }"
            :title="t('links.change_qr_color')"
          >
            <input
              v-model="color"
              type="color"
              class="absolute inset-0 size-full cursor-pointer opacity-0"
              :aria-label="t('links.change_qr_color')"
              :title="t('links.change_qr_color')"
            >
          </label>
        </div>

        <Label
          for="qr-transparent-bg" class="
            ml-auto shrink-0 cursor-pointer text-xs
          "
        >{{ t('links.qr.transparent_bg') }}</Label>
        <Checkbox
          id="qr-transparent-bg"
          v-model:checked="transparentBg"
        />
      </div>

      <div class="flex items-center gap-3">
        <Label class="w-20 shrink-0 text-xs">{{ t('links.qr.dot_style') }}</Label>
        <Select v-model="dotStyle">
          <SelectTrigger size="sm" class="flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="style in DOT_STYLES" :key="style.value" :value="style.value">
              {{ t(style.labelKey) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-3">
        <Label class="w-20 shrink-0 text-xs">{{ t('links.qr.corner_style') }}</Label>
        <Select v-model="cornerSquareStyle">
          <SelectTrigger size="sm" class="flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="style in CORNER_SQUARE_STYLES" :key="style.value" :value="style.value">
              {{ t(style.labelKey) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-3">
        <Label class="w-20 shrink-0 text-xs">{{ t('links.qr.corner_dot') }}</Label>
        <Select v-model="cornerDotStyle">
          <SelectTrigger size="sm" class="flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="style in CORNER_DOT_STYLES" :key="style.value" :value="style.value">
              {{ t(style.labelKey) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-3">
        <Label class="w-20 shrink-0 text-xs">{{ t('links.qr.logo') }}</Label>
        <Select v-model="logoMode">
          <SelectTrigger size="sm" class="flex-1 text-xs">
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
        <div class="w-20 shrink-0" />
        <label
          class="
            flex h-8 flex-1 cursor-pointer items-center gap-2 rounded-md border
            border-input px-3 text-xs ring-offset-background transition-colors
            focus-within:ring-3 focus-within:ring-ring/50
            hover:bg-accent
          "
        >
          <ImagePlus aria-hidden="true" class="size-3.5 shrink-0" />
          <span class="truncate">{{ customLogoUrl ? t('links.qr.logo_change') : t('links.qr.logo_upload') }}</span>
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            @change="onCustomLogoUpload"
          >
        </label>
      </div>

      <div class="flex items-center gap-3 pt-1">
        <Select v-model="downloadFormat">
          <SelectTrigger size="sm" class="w-24 text-xs" :aria-label="t('links.qr.download_format')">
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
          <Download aria-hidden="true" class="mr-2 size-4" />
          {{ t('links.download_qr_code') }}
        </Button>
      </div>
    </div>
  </div>
</template>
