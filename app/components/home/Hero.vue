<script setup lang="ts">
import { ArrowRight, ChevronDown } from '@lucide/vue'
import { GitHubIcon, XIcon } from 'vue3-simple-icons'
import heroUrl from '@/assets/images/hero.svg?url'

const { title, description, twitter } = useAppConfig()
</script>

<template>
  <section class="relative bg-background text-foreground">
    <div
      class="
        py-16
        md:py-24
        lg:py-28
      "
    >
      <div
        class="
          mx-auto flex max-w-6xl flex-col items-center gap-12 px-6
          lg:flex-row lg:justify-between
        "
      >
        <div
          class="
            max-w-xl text-center
            lg:text-left
          "
        >
          <!-- Twitter Follow Badge -->
          <a
            :href="twitter"
            target="_blank"
            rel="noopener"
            :title="$t('home.twitter.follow')"
            class="
              group mx-auto mb-8 inline-flex w-fit items-center gap-2
              rounded-full border border-border/80 bg-card/70 p-1 pr-3.5
              text-card-foreground shadow-xs backdrop-blur-md transition-all
              duration-200
              hover:border-primary/40 hover:bg-card hover:shadow-sm
              focus-visible:ring-2 focus-visible:ring-ring
              lg:mx-0
            "
          >
            <span
              class="
                flex size-6 items-center justify-center rounded-full bg-primary
                text-xs text-primary-foreground transition-transform
                duration-200
                group-hover:scale-105
              "
            >
              <XIcon aria-hidden="true" class="size-3" />
            </span>
            <span class="text-xs font-medium">{{ $t('home.twitter.follow') }}</span>
            <span class="block h-3.5 w-px bg-border" />
            <ArrowRight
              aria-hidden="true" class="
                size-3.5 text-muted-foreground transition-transform duration-200
                group-hover:translate-x-0.5 group-hover:text-foreground
              "
            />
          </a>

          <h1
            class="
              text-4xl font-bold tracking-tight text-balance
              sm:text-5xl
              xl:text-6xl
            "
          >
            {{ title }}
          </h1>
          <p
            class="
              mt-6 text-base/relaxed text-pretty text-muted-foreground
              sm:text-lg
            "
          >
            {{ description }}
          </p>

          <div
            class="
              mt-10 flex flex-col items-center justify-center gap-3
              sm:flex-row
              lg:justify-start
            "
          >
            <Button
              as-child
              size="lg"
              class="
                group shadow-sm transition-all duration-200
                hover:shadow-sm
              "
            >
              <NuxtLink to="/dashboard">
                <span class="text-nowrap">{{ $t('dashboard.title') }}</span>
                <ArrowRight
                  aria-hidden="true" class="
                    ml-1.5 size-4 transition-transform duration-200
                    group-hover:translate-x-0.5
                  "
                />
              </NuxtLink>
            </Button>
            <GithubDropdown align="start">
              <Button
                size="lg"
                variant="ghost"
                class="
                  transition-colors
                  hover:bg-muted
                "
                :title="$t('layouts.footer.social.github')"
              >
                <GitHubIcon aria-hidden="true" />
                <span class="text-nowrap">{{ $t('home.hero.github_repo') }}</span>
                <ChevronDown class="ml-1 size-3.5 opacity-60" aria-hidden="true" />
              </Button>
            </GithubDropdown>
          </div>
        </div>

        <div
          class="
            relative hidden shrink-0 items-center justify-center
            md:flex
          "
        >
          <div
            class="
              pointer-events-none absolute -inset-4 rounded-3xl bg-linear-to-tr
              from-primary/10 via-accent/5 to-transparent blur-2xl
            "
            aria-hidden="true"
          />
          <img
            :src="heroUrl"
            class="
              relative aspect-square w-96 max-w-full shrink-0 bg-transparent
              transition-transform duration-500
              hover:scale-[1.02]
              lg:w-[420px]
            "
            alt="Link sharing illustration"
          >
        </div>
      </div>
    </div>
  </section>
</template>
