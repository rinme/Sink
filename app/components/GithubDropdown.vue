<script setup lang="ts">
import { ExternalLink, GitFork, Star } from '@lucide/vue'
import { GitHubIcon } from 'vue3-simple-icons'

withDefaults(defineProps<{
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}>(), {
  align: 'end',
  sideOffset: 4,
})

const appConfig = useAppConfig()
const resolvedForkGithub = computed(() => (appConfig.forkGithub as string | undefined) || 'https://github.com/rinme/sink')
const resolvedUpstreamGithub = computed(() => (appConfig.upstreamGithub as string | undefined) || (appConfig.github as string | undefined) || 'https://github.com/miantiao-me/sink')
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <slot>
        <Button
          variant="outline"
          size="icon"
          :aria-label="$t('layouts.links.github_aria_label')"
        >
          <GitHubIcon class="size-4" aria-hidden="true" />
        </Button>
      </slot>
    </DropdownMenuTrigger>
    <DropdownMenuContent :align="align" :side-offset="sideOffset" class="w-56">
      <DropdownMenuItem as-child>
        <a
          :href="resolvedForkGithub"
          target="_blank"
          rel="noopener noreferrer"
          class="
            flex w-full cursor-pointer items-center justify-between gap-3 py-2
          "
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <GitFork class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div class="flex flex-col truncate text-left">
              <span class="text-xs/tight font-medium text-foreground">{{ $t('layouts.links.github_fork') }}</span>
              <span class="text-[11px] leading-tight text-muted-foreground">rinme/sink</span>
            </div>
          </div>
          <ExternalLink class="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
        </a>
      </DropdownMenuItem>

      <DropdownMenuItem as-child>
        <a
          :href="resolvedUpstreamGithub"
          target="_blank"
          rel="noopener noreferrer"
          class="
            flex w-full cursor-pointer items-center justify-between gap-3 py-2
          "
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <Star class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div class="flex flex-col truncate text-left">
              <span class="text-xs/tight font-medium text-foreground">{{ $t('layouts.links.github_upstream') }}</span>
              <span class="text-[11px] leading-tight text-muted-foreground">miantiao-me/sink</span>
            </div>
          </div>
          <ExternalLink class="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
        </a>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
