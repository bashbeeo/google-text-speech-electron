    <template>
    <div class="row items-center justify-evenly q-col-gutter-md">
      <div class="col-12">
        <q-input
          outlined
          type="textarea" v-model="text" label="Text to convert" rows="5"></q-input>
      </div>
      <div class="col-12">
        <q-input
          outlined
          v-model="filename"
          label="File Name"></q-input>
      </div>
      <div class="col-6">
        <q-select
          outlined
          :options="languageCodes"
          v-model="languageCode"
          label="Language"

        ></q-select>
      </div>
      <div class="col-6">
        <q-select
          outlined
          :options="names"
          v-model="model"
          option-label="name"
          label="Model"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{scope.opt.name}}</q-item-label>
                <q-item-label caption>{{scope.opt.ssmlGender}} ({{scope.opt.naturalSampleRateHertz}})</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      <div class="col-12">
        <q-btn class="full-width" label="Convert" @click="convert" color="primary"></q-btn>
      </div>
      <div class="col-12">
        <q-btn
          v-if="audio"
          flat
          :icon="playing ? 'pause_circle':'play_circle'"
          @click="startPlay"></q-btn>
        <a :href="'./'+audio_src" v-if="audio_src" download>{{ audio_src }}</a>
      </div>
    </div>
  </template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {Loading, Notify} from 'quasar';
import {voices} from 'src/voices';
import {google} from '@google-cloud/text-to-speech/build/protos/protos';
import SsmlVoiceGender = google.cloud.texttospeech.v1.SsmlVoiceGender;
defineOptions({
    name: 'IndexPage'
  });
  const audio_src= ref('')
  const audio = ref<HTMLAudioElement>()
const playing = ref(false)
  const text = ref('')
  const filename = ref('output')
  const languageCode = ref('en-US')
  const model = ref<{
    languageCodes: string[];
    name: string;
    ssmlGender: SsmlVoiceGender;
    naturalSampleRateHertz: string;
  }|null>(null)
  async function convert() {
    if(!model.value) {
      Notify.create({
        message: 'Select a model',
        type: 'negative'
      })
      return
    }
    Loading.show()
    const obj = await window.admin.convert({
      text:text.value.toString(),
      filename:filename.value.toString(),
      voice: {
        languageCode: languageCode.value,
        name: model.value?.name,
        ssmlGender: model.value?.ssmlGender ?? 'NEUTRAL'
      }
    })
    audio_src.value = obj.filename
    audio.value = new Audio(obj.filename)
    console.log(obj.path)
    audio.value?.addEventListener('ended', function () {
      playing.value = false
    })
    Loading.hide()
  }

  const languageCodes = [...new Set(voices.map((v) => v.languageCodes[0]))].sort()
  const names  = computed(() => {
    if(languageCode.value) {
      return voices.filter(v => v.languageCodes[0] == languageCode.value)
    }
    return []
  })

function startPlay() {
    if(!playing.value) {
      playing.value = true
      audio.value?.play()
    } else {
      playing.value = false
      audio.value?.pause()
    }
}
</script>
