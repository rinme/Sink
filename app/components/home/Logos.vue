<template>
  <section
    class="
      bg-background py-8 text-foreground
      md:py-12
    "
  >
    <div class="mx-auto max-w-6xl px-6">
      <div class="mx-auto flex max-w-xl flex-col items-center gap-6">
        <p
          class="
            text-xs font-semibold tracking-widest text-muted-foreground/80
            uppercase
          "
        >
          Powered by modern edge infrastructure
        </p>
        <div
          class="
            flex w-full items-center justify-center gap-10
            sm:gap-16
          "
        >
          <img
            class="
              h-9 w-auto max-w-[140px] object-contain opacity-70 grayscale
              transition-all duration-300
              hover:opacity-100 hover:grayscale-0
              sm:h-11 sm:max-w-[170px]
            "
            alt="Cloudflare"
            src="@/assets/images/cloudflare.png"
            fetchpriority="high"
            width="350"
            height="176"
          >
          <img
            class="
              h-9 w-auto max-w-[140px] object-contain opacity-70 grayscale
              transition-all duration-300
              hover:opacity-100 hover:grayscale-0
              sm:h-11 sm:max-w-[170px]
            "
            alt="Nuxt.js"
            src="@/assets/images/nuxtjs.png"
            fetchpriority="high"
            width="350"
            height="176"
          >
        </div>
      </div>
    </div>
  </section>
</template>
