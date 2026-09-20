<script setup lang="ts">
import { AreaChart, FileJson, Globe, Hourglass, Languages, Link, Paintbrush, QrCode, ServerOff, Share2, Smartphone, Sparkles } from '@lucide/vue'

const { t } = useI18n()
const features = computed(() => [
  {
    title: t('home.features.url_shortening.title'),
    description: t('home.features.url_shortening.description'),
    icon: Link,
  },
  {
    title: t('home.features.analytics.title'),
    description: t('home.features.analytics.description'),
    icon: AreaChart,
  },
  {
    title: t('home.features.serverless.title'),
    description: t('home.features.serverless.description'),
    icon: ServerOff,
  },
  {
    title: t('home.features.customizable_slug.title'),
    description: t('home.features.customizable_slug.description'),
    icon: Paintbrush,
  },
  {
    title: t('home.features.ai_slug.title'),
    description: t('home.features.ai_slug.description'),
    icon: Sparkles,
  },
  {
    title: t('home.features.link_expiration.title'),
    description: t('home.features.link_expiration.description'),
    icon: Hourglass,
  },
  {
    title: t('home.features.device_routing.title'),
    description: t('home.features.device_routing.description'),
    icon: Smartphone,
  },
  {
    title: t('home.features.og_preview.title'),
    description: t('home.features.og_preview.description'),
    icon: Share2,
  },
  {
    title: t('home.features.realtime_analytics.title'),
    description: t('home.features.realtime_analytics.description'),
    icon: Globe,
  },
  {
    title: t('home.features.qr_code.title'),
    description: t('home.features.qr_code.description'),
    icon: QrCode,
  },
  {
    title: t('home.features.import_export.title'),
    description: t('home.features.import_export.description'),
    icon: FileJson,
  },
  {
    title: t('home.features.multi_language.title'),
    description: t('home.features.multi_language.description'),
    icon: Languages,
  },
])
</script>

<template>
  <section
    class="
      bg-background py-16 text-foreground
      md:py-24
    "
  >
    <div
      class="
        mx-auto max-w-6xl space-y-12 px-6
        md:space-y-16
      "
    >
      <div
        class="mx-auto max-w-2xl space-y-4 text-center"
      >
        <h2
          class="
            text-3xl font-bold tracking-tight text-balance
            sm:text-4xl
            lg:text-5xl
          "
        >
          {{ $t('home.features.title') }}
        </h2>
        <p
          class="
            text-base/relaxed text-pretty text-muted-foreground
            sm:text-lg
          "
        >
          {{ $t('home.features.subtitle') }}
        </p>
      </div>

      <div
        class="
          grid grid-cols-1 gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        <div
          v-for="item in features"
          :key="item.title"
          class="
            group relative flex flex-col justify-between overflow-hidden
            rounded-2xl border border-border/70 bg-card/40 p-6 backdrop-blur-xs
            transition-all duration-300
            hover:-translate-y-1 hover:border-border hover:bg-card
            hover:shadow-md
          "
        >
          <div>
            <div
              class="
                mb-4 flex size-10 items-center justify-center rounded-xl border
                border-border/60 bg-muted/60 text-foreground transition-all
                duration-300
                group-hover:scale-105 group-hover:border-primary/20
                group-hover:bg-primary group-hover:text-primary-foreground
                group-hover:shadow-xs
              "
            >
              <component
                :is="item.icon"
                class="size-5 shrink-0"
                aria-hidden="true"
              />
            </div>
            <h3 class="text-base font-semibold tracking-tight text-foreground">
              {{ item.title }}
            </h3>
            <p
              class="mt-2 text-sm/relaxed text-pretty text-muted-foreground"
            >
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
