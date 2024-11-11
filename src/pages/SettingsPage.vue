<template>
  <q-card>
    <q-toolbar>
      <q-toolbar-title>Settings</q-toolbar-title>
    </q-toolbar>
    <q-card-section>
      <div class="row">
        <div class="col-12">
          <q-input outlined dense v-model="settings.api_key" label="Google API Key"></q-input>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const settings = ref({
    api_key: ''
  })
</script>
