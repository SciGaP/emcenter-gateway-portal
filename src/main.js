import Vue from 'vue'
import App from './App.vue'
import router from "./router.js";
import store from './store/index.js'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import Vuelidate from 'vuelidate'

import i18n from "./i18n";
import "rivet-uits/js/rivet.min"

Vue.use(BootstrapVue)
Vue.use(Vuelidate)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Vue.config.productionTip = false

new Vue({
    router,
    store,
    i18n,
    render: h => h(App),
}).$mount('#app')


