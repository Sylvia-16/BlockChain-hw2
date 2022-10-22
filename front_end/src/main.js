import { createApp } from "vue";

import Vue from "vue";
import App from "./App.vue";
import Web3 from "web3";
Vue.config.productionTip = false;
Vue.prototype.Web3 = Web3;
createApp(App).mount("#app");
