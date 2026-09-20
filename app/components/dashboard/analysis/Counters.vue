<script setup lang="ts">
import type { CounterData } from '@/types'
import { Flame, MousePointerClick, Users } from '@lucide/vue'
import NumberFlow from '@number-flow/vue'

const defaultData: CounterData = Object.freeze({
  visits: 0,
  visitors: 0,
  referers: 0,
})

const counters = ref<CounterData>(defaultData)
const loading = shallowRef(false)
const error = shallowRef(false)
const hasLoaded = shallowRef(false)
const retryKey = shallowRef(0)

const id = inject(LINK_ID_KEY, computed(() => undefined))
const analysisStore = useDashboardAnalysisStore()

watch([() => analysisStore.dateRange, () => analysisStore.filters, retryKey], async (_values, _oldValues, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  loading.value = true
  error.value = false
  try {
    const result = await useAPI<{ data: CounterData[] }>('/api/stats/counters', {
      signal: controller.signal,
      query: {
        ...analysisStore.filters,
        id: id.value,
        startAt: analysisStore.dateRange.startAt,
        endAt: analysisStore.dateRange.endAt,
      },
    })
    if (!controller.signal.aborted) {
      counters.value = result.data?.[0] ?? defaultData
      hasLoaded.value = true
    }
  }
  catch {
    if (!controller.signal.aborted)
      error.value = true
  }
  finally {
    if (!controller.signal.aborted)
      loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <Alert v-if="error" variant="destructive">
    <AlertTitle>{{ $t('dashboard.realtime.stats_error') }}</AlertTitle>
    <AlertDescription>
      <Button
        type="button"
        variant="link"
        size="sm"
        class="text-destructive"
        @click="retryKey++"
      >
        {{ $t('common.try_again') }}
      </Button>
    </AlertDescription>
  </Alert>
  <div
    v-else
    :aria-busy="loading"
    class="
      grid gap-4
      sm:grid-cols-3 sm:gap-3
      lg:gap-4
    "
  >
    <Card
      size="sm" class="
        transition-all duration-200
        hover:border-border hover:shadow-xs
      "
    >
      <CardHeader
        class="flex flex-row items-center justify-between"
      >
        <CardTitle class="text-sm font-medium">
          <h2>{{ $t('dashboard.visits') }}</h2>
        </CardTitle>
        <div
          class="
            flex size-7 items-center justify-center rounded-md bg-muted/60
            text-muted-foreground
          "
        >
          <MousePointerClick
            aria-hidden="true" class="size-3.5"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div class="relative min-h-8">
          <NumberFlow
            class="block text-2xl font-bold tracking-tight tabular-nums"
            :class="{ 'opacity-0': counters.visits === 0 }"
            :value="counters.visits"
          />
          <Skeleton
            v-if="loading && !hasLoaded"
            class="absolute inset-y-0 left-0 h-8 w-20"
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
    <Card
      size="sm" class="
        transition-all duration-200
        hover:border-border hover:shadow-xs
      "
    >
      <CardHeader
        class="flex flex-row items-center justify-between"
      >
        <CardTitle class="text-sm font-medium">
          <h2>{{ $t('dashboard.visitors') }}</h2>
        </CardTitle>
        <div
          class="
            flex size-7 items-center justify-center rounded-md bg-muted/60
            text-muted-foreground
          "
        >
          <Users aria-hidden="true" class="size-3.5" />
        </div>
      </CardHeader>
      <CardContent>
        <div class="relative min-h-8">
          <NumberFlow
            class="block text-2xl font-bold tracking-tight tabular-nums"
            :class="{ 'opacity-0': counters.visitors === 0 }"
            :value="counters.visitors"
          />
          <Skeleton
            v-if="loading && !hasLoaded"
            class="absolute inset-y-0 left-0 h-8 w-20"
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
    <Card
      size="sm" class="
        transition-all duration-200
        hover:border-border hover:shadow-xs
      "
    >
      <CardHeader
        class="flex flex-row items-center justify-between"
      >
        <CardTitle class="text-sm font-medium">
          <h2>{{ $t('dashboard.referers') }}</h2>
        </CardTitle>
        <div
          class="
            flex size-7 items-center justify-center rounded-md bg-muted/60
            text-muted-foreground
          "
        >
          <Flame aria-hidden="true" class="size-3.5" />
        </div>
      </CardHeader>
      <CardContent>
        <div class="relative min-h-8">
          <NumberFlow
            class="block text-2xl font-bold tracking-tight tabular-nums"
            :class="{ 'opacity-0': counters.referers === 0 }"
            :value="counters.referers"
          />
          <Skeleton
            v-if="loading && !hasLoaded"
            class="absolute inset-y-0 left-0 h-8 w-20"
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
