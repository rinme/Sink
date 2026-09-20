<script setup lang="ts">
import { GitFork, Star } from '@lucide/vue'
import NumberFlow from '@number-flow/vue'

const { rawStats } = useGithubStats()
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
        mx-auto max-w-6xl space-y-10 px-6
        md:space-y-14
      "
    >
      <div class="relative z-10 mx-auto max-w-xl space-y-3 text-center">
        <h2
          class="
            text-3xl font-bold tracking-tight text-balance
            sm:text-4xl
          "
        >
          {{ $t('home.stats.title') }}
        </h2>
        <p class="text-base text-muted-foreground">
          {{ $t('home.stats.subtitle') }}
        </p>
      </div>

      <div
        class="
          mx-auto grid max-w-3xl grid-cols-1 gap-6
          sm:grid-cols-2
        "
      >
        <div
          class="
            group flex flex-col items-center justify-center rounded-2xl border
            border-border/70 bg-card/40 p-8 text-center backdrop-blur-xs
            transition-all duration-300
            hover:border-border hover:bg-card hover:shadow-md
          "
        >
          <div
            class="
              mb-4 flex size-11 items-center justify-center rounded-xl
              bg-primary/10 text-primary transition-transform duration-300
              group-hover:scale-110
            "
          >
            <Star class="size-5" aria-hidden="true" />
          </div>
          <ClientOnly>
            <template #fallback>
              <Skeleton class="h-14 w-28" />
            </template>
            <NumberFlow
              class="
                text-5xl font-bold tracking-tight tabular-nums
                sm:text-6xl
              "
              :value="rawStats.stars"
            />
          </ClientOnly>
          <p class="mt-2 text-sm font-medium text-muted-foreground">
            {{ $t('home.stats.stars') }}
          </p>
        </div>

        <div
          class="
            group flex flex-col items-center justify-center rounded-2xl border
            border-border/70 bg-card/40 p-8 text-center backdrop-blur-xs
            transition-all duration-300
            hover:border-border hover:bg-card hover:shadow-md
          "
        >
          <div
            class="
              mb-4 flex size-11 items-center justify-center rounded-xl
              bg-primary/10 text-primary transition-transform duration-300
              group-hover:scale-110
            "
          >
            <GitFork class="size-5" aria-hidden="true" />
          </div>
          <ClientOnly>
            <template #fallback>
              <Skeleton class="h-14 w-28" />
            </template>
            <NumberFlow
              class="
                text-5xl font-bold tracking-tight tabular-nums
                sm:text-6xl
              "
              :value="rawStats.forks"
            />
          </ClientOnly>
          <p class="mt-2 text-sm font-medium text-muted-foreground">
            {{ $t('home.stats.forks') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
