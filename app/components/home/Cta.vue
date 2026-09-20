<script setup lang="ts">
import { ArrowRight, BookOpen } from '@lucide/vue'

const { documentation } = useAppConfig()
</script>

<template>
  <section
    class="
      relative overflow-hidden bg-background py-16 text-foreground
      md:py-24
    "
  >
    <div class="mx-auto max-w-5xl px-6">
      <div
        class="
          relative overflow-hidden rounded-3xl border border-border/80
          bg-linear-to-b from-card/90 to-card/40 p-8 text-center shadow-lg
          backdrop-blur-md
          sm:p-12
          md:p-16
        "
      >
        <!-- Atmospheric subtle glow -->
        <div
          class="
            pointer-events-none absolute -top-24 left-1/2 size-72
            -translate-x-1/2 rounded-full bg-primary/10 blur-3xl
          "
          aria-hidden="true"
        />

        <h2
          class="
            relative text-3xl font-bold tracking-tight text-balance
            sm:text-4xl
          "
        >
          {{ $t('home.cta.title') }}
        </h2>
        <p
          class="
            relative mx-auto mt-4 max-w-xl text-pretty text-muted-foreground
            sm:text-base
          "
        >
          {{ $t('home.cta.description') }}
        </p>

        <div class="relative mt-8 flex flex-wrap justify-center gap-4">
          <Button
            as-child
            size="lg"
            class="
              group shadow-sm transition-all duration-200
              hover:shadow-sm
            "
          >
            <a
              :href="`${documentation}/guide/getting-started`"
              target="_blank"
              rel="noopener noreferrer"
              :title="$t('home.cta.button')"
            >
              <BookOpen aria-hidden="true" class="mr-2 size-4" />
              <span>{{ $t('home.cta.button') }}</span>
              <ArrowRight
                aria-hidden="true" class="
                  ml-2 size-4 transition-transform duration-200
                  group-hover:translate-x-0.5
                "
              />
            </a>
          </Button>

          <Button
            as-child
            size="lg"
            variant="outline"
            class="
              transition-colors
              hover:bg-accent
            "
          >
            <NuxtLink to="/dashboard" :title="$t('dashboard.title')">
              {{ $t('dashboard.title') }}
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
