<template>
  <router-view />
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  defineOptions({
    name: 'App'
  });
  onMounted(async () => {
    const admin = window.admin
    const res = await admin.greeting()
    console.log(res)
  })
</script>
