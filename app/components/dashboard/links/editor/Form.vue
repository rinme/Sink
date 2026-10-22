<script setup lang="ts">
import type { DashboardLink } from '@/types/dashboard-links'
import { ExternalLink, Globe, Link as LinkIcon, Share2, Shuffle, SlidersHorizontal, Sparkles } from '@lucide/vue'
import { useForm } from '@tanstack/vue-form'
import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { MAX_URL_LENGTH, nanoid, SlugSchema } from '#shared/schemas/link'

const props = defineProps<{
  link: Partial<DashboardLink>
  isEdit: boolean
  formId: string
}>()

const emit = defineEmits<{
  'success': [link: DashboardLink]
  'update:dirty': [value: boolean]
  'update:submitting': [value: boolean]
}>()

const { t, locale } = useI18n()
const linksSearchStore = useDashboardLinksSearchStore()
const requestUrl = useRequestURL()

const slugValidator = SlugSchema
const commentValidator = z.string().max(500).optional()

const generateSlug = nanoid()

const defaultValues = createLinkFormInitialValues(props.link)

const form = useForm({
  defaultValues,
  onSubmit: async ({ value }) => {
    try {
      const linkData = normalizeLinkFormSubmitPayload(value, props.isEdit)
      const { link: newLink } = await useAPI<{ link: DashboardLink }>(
        props.isEdit ? '/api/link/edit' : '/api/link/create',
        {
          method: props.isEdit ? 'PUT' : 'POST',
          body: linkData,
        },
      )
      emit('success', newLink)
      toast(props.isEdit ? t('links.update_success') : t('links.create_success'))
    }
    catch (error) {
      console.error(error)
      toast.error(props.isEdit ? t('links.update_failed') : t('links.create_failed'), {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  },
})
const isSubmitting = form.useStore(state => state.isSubmitting)
const isDirty = form.useStore(state => !state.isDefaultValue)
const fieldMetaStore = form.useStore(state => state.fieldMeta)
const tagsInput = useTemplateRef<{ commit: () => boolean }>('tagsInput')

watch(isSubmitting, value => emit('update:submitting', value), { immediate: true })
watch(isDirty, value => emit('update:dirty', value), { immediate: true })

function makeUrlValidator(optional: boolean) {
  return ({ value }: { value: unknown }): string | undefined => {
    const error = getLinkUrlValidationError(value, MAX_URL_LENGTH, optional)
    if (!error)
      return undefined
    return t(`links.form.url_${error.kind}`, {
      length: 'length' in error ? error.length.toLocaleString(locale.value) : '',
      max: MAX_URL_LENGTH.toLocaleString(locale.value),
    })
  }
}

const validateUrl = makeUrlValidator(false)
const validateOptionalUrl = makeUrlValidator(true)
const validateSlug = makeZodValidator(slugValidator)
const validateComment = makeZodValidator(commentValidator)
const timerValidator = z.preprocess(
  (val) => {
    if (val === '' || val === undefined || val === null)
      return undefined
    const num = Number(val)
    return Number.isNaN(num) ? val : num
  },
  z.number().int().min(1).max(60).optional(),
)
const validateTimer = makeZodValidator(timerValidator)

const utmBuilderOpen = ref(false)

type TabKey = 'general' | 'settings' | 'social' | 'routing'
const activeTab = ref<TabKey>('general')

const TAB_FIELDS: Record<TabKey, readonly string[]> = {
  general: ['url', 'slug', 'comment', 'tags'],
  settings: ['redirectWithQuery', 'cloaking', 'proxy', 'unsafe', 'nsfw', 'timer', 'expiration', 'password'],
  social: ['title', 'description', 'image'],
  routing: ['google', 'apple', 'geo'],
}

function hasTabError(tab: TabKey): boolean {
  const metaMap = fieldMetaStore.value as Record<string, { errors?: unknown[] } | undefined>
  return TAB_FIELDS[tab].some((fieldName) => {
    const meta = metaMap[fieldName]
    return Boolean(meta?.errors?.length)
  })
}

function resetActiveTab() {
  activeTab.value = 'general'
}

function formatErrors(errors: unknown[]): string[] {
  return errors
    .map((e) => {
      if (typeof e === 'string')
        return e
      if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string')
        return e.message
      return null
    })
    .filter((m): m is string => m !== null)
}

function randomSlug() {
  form.setFieldValue('slug', generateSlug())
}

function initializeRandomSlug() {
  form.reset({
    ...form.state.values,
    slug: generateSlug(),
  })
}

const aiSlugPending = ref(false)
async function aiSlug() {
  const url = form.getFieldValue('url')
  if (!url)
    return

  aiSlugPending.value = true
  try {
    const result = await useAPI<{ slug: string }>('/api/link/ai', {
      query: { url },
    })
    form.setFieldValue('slug', result.slug)
  }
  catch (error) {
    console.error(error)
    toast.error(t('links.ai_slug_failed'), {
      description: error instanceof Error ? error.message : String(error),
    })
  }
  finally {
    aiSlugPending.value = false
  }
}

const currentSlug = form.useStore(state => state.values.slug || '')
const currentUrl = form.useStore(state => state.values.url || '')
const duplicateLink = shallowRef<Awaited<ReturnType<typeof linksSearchStore.findDuplicateLink>>>()
let duplicateRequestGeneration = 0

const findDuplicateLink = useDebounceFn(async (url: string) => {
  const generation = ++duplicateRequestGeneration
  const targetUrl = url.trim()

  if (props.isEdit || !targetUrl) {
    duplicateLink.value = undefined
    return
  }

  try {
    const match = await linksSearchStore.findDuplicateLink(targetUrl)
    if (generation === duplicateRequestGeneration) {
      duplicateLink.value = match
    }
  }
  catch {
    if (generation === duplicateRequestGeneration) {
      duplicateLink.value = undefined
    }
  }
}, 300)

watch(currentUrl, (url) => {
  void findDuplicateLink(url)
}, { immediate: true })

const shortDuplicateLink = computed(() => {
  if (!duplicateLink.value)
    return ''
  return new URL(`/${duplicateLink.value.slug}`, requestUrl.origin).toString()
})

function isInvalid(field: AnyFieldApi) {
  return field.state.meta.isTouched && field.state.meta.errors.length > 0
}

function getAriaInvalid(field: AnyFieldApi) {
  return isInvalid(field) ? 'true' : undefined
}

async function applyUtmUrl(url: string) {
  form.setFieldValue('url', url)
  await form.validateField('url', 'blur')
}

async function submitForm() {
  if (tagsInput.value?.commit() === false)
    return

  await form.handleSubmit()
}

defineExpose({ initializeRandomSlug, resetActiveTab, submitForm })
</script>

<template>
  <form
    :id="formId"
    class="flex flex-col gap-6"
    novalidate
    @submit.prevent="submitForm"
  >
    <Alert variant="destructive">
      <AlertDescription>
        {{ $t('links.form.risk_warning') }}
      </AlertDescription>
    </Alert>

    <fieldset :disabled="isSubmitting" class="space-y-6">
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="general" class="relative gap-1.5">
            <LinkIcon class="size-4 shrink-0" />
            <span class="truncate">{{ $t('links.tabs.general') }}</span>
            <span
              v-if="hasTabError('general')"
              class="
                absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive
              "
            />
          </TabsTrigger>
          <TabsTrigger value="settings" class="relative gap-1.5">
            <SlidersHorizontal class="size-4 shrink-0" />
            <span class="truncate">{{ $t('links.tabs.settings') }}</span>
            <span
              v-if="hasTabError('settings')"
              class="
                absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive
              "
            />
          </TabsTrigger>
          <TabsTrigger value="social" class="relative gap-1.5">
            <Share2 class="size-4 shrink-0" />
            <span class="truncate">{{ $t('links.tabs.social') }}</span>
            <span
              v-if="hasTabError('social')"
              class="
                absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive
              "
            />
          </TabsTrigger>
          <TabsTrigger value="routing" class="relative gap-1.5">
            <Globe class="size-4 shrink-0" />
            <span class="truncate">{{ $t('links.tabs.routing') }}</span>
            <span
              v-if="hasTabError('routing')"
              class="
                absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive
              "
            />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" class="space-y-4 pt-4 outline-none">
          <FieldGroup>
            <form.Field
              v-slot="{ field }"
              name="url"
              :validators="{ onBlur: validateUrl, onSubmit: validateUrl }"
            >
              <Field :data-invalid="isInvalid(field)">
                <div class="flex items-center justify-between">
                  <FieldLabel :for="`${formId}-${field.name}`">
                    {{ $t('links.form.url') }}
                  </FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="px-3 text-xs"
                    :aria-label="$t('links.form.utm_builder')"
                    @click="utmBuilderOpen = true"
                  >
                    UTM
                  </Button>
                </div>
                <Input
                  :id="`${formId}-${field.name}`"
                  :name="field.name"
                  inputmode="url"
                  :model-value="field.state.value"
                  :aria-invalid="getAriaInvalid(field)"
                  placeholder="https://example.com"
                  autocomplete="off"
                  @blur="field.handleBlur"
                  @input="field.handleChange(($event.target as HTMLInputElement).value)"
                />
                <FieldDescription
                  v-if="!isInvalid(field) && duplicateLink"
                  class="flex items-center gap-2"
                >
                  <span>{{ $t('links.form.duplicate_url_hint', { shortLink: shortDuplicateLink }) }}</span>
                  <NuxtLink
                    :to="getDashboardLinkDetailLocation(duplicateLink.slug)"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="$t('links.form.duplicate_url_hint', { shortLink: shortDuplicateLink })"
                    class="
                      inline-flex shrink-0 items-center text-primary/80
                      no-underline
                      hover:text-primary
                    "
                  >
                    <ExternalLink aria-hidden="true" class="size-4" />
                  </NuxtLink>
                </FieldDescription>
                <FieldDescription v-else-if="!isInvalid(field)">
                  {{ $t('links.form.url_description', { max: MAX_URL_LENGTH.toLocaleString(locale) }) }}
                </FieldDescription>
                <FieldError
                  v-if="isInvalid(field)"
                  :errors="formatErrors(field.state.meta.errors)"
                />
              </Field>
            </form.Field>

            <form.Field
              v-slot="{ field }"
              name="slug"
              :validators="{ onBlur: validateSlug, onSubmit: validateSlug }"
            >
              <Field :data-invalid="isInvalid(field)">
                <div class="flex items-center justify-between">
                  <FieldLabel :for="`${formId}-${field.name}`">
                    {{ $t('links.form.slug') }}
                  </FieldLabel>
                  <div v-if="!isEdit" class="flex space-x-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="$t('links.form.generate_random_slug')"
                      @click="randomSlug"
                    >
                      <Shuffle aria-hidden="true" class="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="$t('links.form.generate_ai_slug')"
                      :disabled="aiSlugPending"
                      @click="aiSlug"
                    >
                      <Sparkles
                        aria-hidden="true"
                        class="size-4"
                        :class="{ 'motion-safe:animate-bounce': aiSlugPending }"
                      />
                    </Button>
                  </div>
                </div>
                <Input
                  :id="`${formId}-${field.name}`"
                  :name="field.name"
                  :model-value="field.state.value"
                  :disabled="isEdit"
                  :aria-invalid="getAriaInvalid(field)"
                  placeholder="my-short-link"
                  autocomplete="off"
                  autocapitalize="none"
                  spellcheck="false"
                  @blur="field.handleBlur"
                  @input="field.handleChange(($event.target as HTMLInputElement).value)"
                />
                <FieldError
                  v-if="isInvalid(field)"
                  :errors="formatErrors(field.state.meta.errors)"
                />
              </Field>
            </form.Field>

            <form.Field
              v-slot="{ field }"
              name="comment"
              :validators="{ onBlur: validateComment, onSubmit: validateComment }"
            >
              <DashboardLinksEditorFieldTextarea
                :field="field"
                :input-id="`${formId}-${field.name}`"
                :label="$t('links.form.comment')"
                :invalid="isInvalid(field)"
                :aria-invalid="getAriaInvalid(field)"
                :errors="formatErrors(field.state.meta.errors)"
              />
            </form.Field>

            <form.Field v-slot="{ field }" name="tags">
              <DashboardLinksEditorTagsInput
                ref="tagsInput"
                :model-value="field.state.value"
                @update:model-value="field.handleChange"
              />
            </form.Field>
          </FieldGroup>
        </TabsContent>

        <DashboardLinksEditorAdvanced
          :form="form"
          :id-prefix="formId"
          :validate-optional-url="validateOptionalUrl"
          :validate-timer="validateTimer"
          :is-invalid="isInvalid"
          :get-aria-invalid="getAriaInvalid"
          :format-errors="formatErrors"
          :current-slug="currentSlug"
        />
      </Tabs>
    </fieldset>
  </form>

  <DashboardLinksEditorUtmBuilderModal
    v-model:open="utmBuilderOpen"
    :id-prefix="formId"
    :url="currentUrl"
    @apply="applyUtmUrl"
  />
</template>
