<template>
  <div
    class="
      relative flex flex-col justify-center overflow-x-clip bg-background
      text-foreground
    "
  >
    <!-- Background subtle ambient lighting -->
    <div
      class="
        pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]
        overflow-hidden
      "
      aria-hidden="true"
    >
      <div
        class="
          absolute top-[-20%] left-1/2 h-[500px] w-[800px] max-w-[100vw]
          -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]
        "
      />
    </div>

    <HomeHero />
    <HomeLogos />
    <HomeFeatures />
    <HomeStats />
    <HomeCta />
  </div>
</template>
